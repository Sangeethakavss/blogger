import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('🚀 Starting Blogify Server for E2E Integration Testing...');

  const serverProcess = spawn('node', ['src/server.js'], {
    cwd: path.resolve(__dirname, 'backend'),
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  serverProcess.stdout.on('data', (d) => process.stdout.write(`[SERVER]: ${d}`));
  serverProcess.stderr.on('data', (d) => process.stderr.write(`[SERVER-ERR]: ${d}`));

  const BASE_URL = 'http://localhost:5000';

  // Wait until server is healthy (poll up to 20 seconds)
  console.log('⏳ Waiting for server and database connection...');
  let ready = false;
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.status === 200) {
        ready = true;
        console.log(`\n🎉 Server is live and healthy after ${i + 1}s!\n`);
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (!ready) {
    console.error('❌ Server failed to become healthy within 20 seconds.');
    serverProcess.kill('SIGINT');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  try {
    // 1. Health check
    await assertTest('GET /api/health returns 200 OK', async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (data.status !== 'ok') throw new Error('Status not ok');
    });

    // 2. User registration
    let johnToken = null;
    let johnUser = null;
    const authorEmail = `author_${Date.now()}@example.com`;
    await assertTest('POST /api/auth/register registers author', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Author Tester',
          email: authorEmail,
          password: 'password123',
        }),
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      johnToken = data.token;
      johnUser = data.user;
    });

    // 3. User login
    await assertTest('POST /api/auth/login authenticates registered author', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authorEmail,
          password: 'password123',
        }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      johnToken = data.token;
    });

    // 4. Create initial blogs for testing
    let firstBlogId = null;
    await assertTest('POST /api/blogs creates initial test blogs', async () => {
      // Create Technology blog
      const res1 = await fetch(`${BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${johnToken}`,
        },
        body: JSON.stringify({
          title: 'The Future of Remote Work',
          category: 'Technology',
          content: 'Exploring how remote work transforms technology teams and collaboration.',
          status: 'Published',
        }),
      });
      if (res1.status !== 201) throw new Error(`Status ${res1.status}`);
      const data1 = await res1.json();
      firstBlogId = data1.blog._id;

      // Create Travel blog
      const res2 = await fetch(`${BASE_URL}/api/blogs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${johnToken}`,
        },
        body: JSON.stringify({
          title: 'Adventures in Alpine Mountains',
          category: 'Travel',
          content: 'Journey through scenic trails and breathtaking altitudes.',
          status: 'Published',
        }),
      });
      if (res2.status !== 201) throw new Error(`Status ${res2.status}`);
    });

    // 5. Fetch blogs
    await assertTest('GET /api/blogs returns published blogs', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs`);
      if (res.status !== 200) throw new Error(`Status was ${res.status}`);
      const data = await res.json();
      if (!data.blogs || data.blogs.length === 0) throw new Error('No blogs returned');
    });

    // 6. Search filtering
    await assertTest('GET /api/blogs?search=remote filters correctly', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs?search=remote`);
      const data = await res.json();
      if (data.blogs.length === 0) throw new Error('Search failed to find remote work post');
      if (!data.blogs[0].title.toLowerCase().includes('remote')) {
        throw new Error('Title does not match search term');
      }
    });

    // 7. Category filtering
    await assertTest('GET /api/blogs?category=Travel filters by category', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs?category=Travel`);
      const data = await res.json();
      if (data.blogs.length === 0) throw new Error('Category filter returned 0 blogs');
      if (data.blogs[0].category !== 'Travel') throw new Error('Returned non-Travel blog');
    });

    // 8. Register second reader
    let newUserToken = null;
    let newUserId = null;
    const testEmail = `reader_${Date.now()}@example.com`;
    await assertTest('POST /api/auth/register registers second reader', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Reader Tester',
          email: testEmail,
          password: 'password123',
        }),
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token) throw new Error('No token returned');
      newUserToken = data.token;
      newUserId = data.user._id;
    });

    // 9. Verify /api/auth/me
    await assertTest('GET /api/auth/me returns profile & stats', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${johnToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.user.email !== authorEmail) throw new Error('Wrong user returned');
      if (typeof data.stats.totalBlogs !== 'number') throw new Error('Stats missing');
    });

    // 10. Update blog as author
    await assertTest('PUT /api/blogs/:id allows author to update', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${johnToken}`,
        },
        body: JSON.stringify({
          title: 'The Future of Remote Work (Updated)',
          content: 'Updated content with additional verification notes.',
        }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.blog.title !== 'The Future of Remote Work (Updated)') {
        throw new Error('Title was not updated');
      }
    });

    // 11. Enforce authorization: Non-author cannot edit author post
    await assertTest('PUT /api/blogs/:id denies non-author with 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newUserToken}`,
        },
        body: JSON.stringify({
          title: 'Malicious Hijack Attempt',
        }),
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 12. Toggle like on blog
    await assertTest('POST /api/blogs/:id/like toggles likes', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${newUserToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.liked !== true) throw new Error('Expected liked to be true');
    });

    // 13. Add comment
    await assertTest('POST /api/blogs/:id/comments adds comment', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${newUserToken}`,
        },
        body: JSON.stringify({
          content: 'Insightful article! Testing comments from automated runner.',
        }),
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (data.comments.length === 0) throw new Error('No comments returned');
    });

    // 14. Enforce authorization: Non-author cannot delete author post
    await assertTest('DELETE /api/blogs/:id denies non-author with 403 Forbidden', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${newUserToken}` },
      });
      if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    });

    // 15. Verify Views functionality (idempotent GET and dedicated view recording)
    await assertTest('GET is idempotent and POST /api/blogs/:id/view increments views', async () => {
      // 1. Initial GET
      const res1 = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`);
      const data1 = await res1.json();
      const initialViews = data1.blog.views;

      // 2. Second GET - must NOT increment views (idempotent read)
      const res2 = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`);
      const data2 = await res2.json();
      const viewsAfterGet = data2.blog.views;

      if (viewsAfterGet !== initialViews) {
        throw new Error(`GET is not idempotent: views changed from ${initialViews} to ${viewsAfterGet}`);
      }

      // 3. POST /api/blogs/:id/view - must increment views by 1
      const resView = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/view`, {
        method: 'POST',
      });
      if (resView.status !== 200) throw new Error(`Status ${resView.status}`);
      const viewData = await resView.json();
      if (viewData.views !== initialViews + 1) {
        throw new Error(`View did not increment by 1: expected ${initialViews + 1}, got ${viewData.views}`);
      }

      // 4. Verify GET now reflects the incremented view
      const res3 = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`);
      const data3 = await res3.json();
      if (data3.blog.views !== initialViews + 1) {
        throw new Error(`GET did not reflect updated view: expected ${initialViews + 1}, got ${data3.blog.views}`);
      }
    });

    // 16. Verify Save / Bookmark functionality
    await assertTest('POST /api/blogs/:id/save toggles bookmark and GET /api/blogs/user/saved returns saved collection', async () => {
      // 1. Save the blog
      const resSave = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${newUserToken}` },
      });
      if (resSave.status !== 200) throw new Error(`Status ${resSave.status}`);
      const saveData = await resSave.json();
      if (saveData.saved !== true) throw new Error('Expected blog to be saved');

      // 2. Fetch user's saved list
      const resSavedList = await fetch(`${BASE_URL}/api/blogs/user/saved`, {
        headers: { Authorization: `Bearer ${newUserToken}` },
      });
      if (resSavedList.status !== 200) throw new Error(`Status ${resSavedList.status}`);
      const savedListData = await resSavedList.json();
      if (!savedListData.blogs || savedListData.blogs.length === 0) {
        throw new Error('Expected saved blogs array with at least 1 item');
      }
      if (savedListData.blogs[0]._id !== firstBlogId) {
        throw new Error('Saved blog ID did not match');
      }

      // 3. Unsave the blog
      const resUnsave = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${newUserToken}` },
      });
      const unsaveData = await resUnsave.json();
      if (unsaveData.saved !== false) throw new Error('Expected blog to be unsaved');
    });

    // 17. Author deletes post
    await assertTest('DELETE /api/blogs/:id allows author to delete', async () => {
      const res = await fetch(`${BASE_URL}/api/blogs/${firstBlogId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${johnToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
    });

  } finally {
    console.log(`\n========================================`);
    console.log(`🏁 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`========================================\n`);

    serverProcess.kill('SIGINT');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
