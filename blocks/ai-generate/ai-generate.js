const AI_GENERATE_URL = 'https://YOUR-AI-SERVICE.edgecompute.app/api/generate';

export default async function decorate(block) {
  const rows = [...block.children];
  const prompt = rows[0]?.textContent?.trim() || '';
  const format = (rows[1]?.textContent?.trim() || 'text').toLowerCase();

  block.textContent = '';

  if (!prompt) {
    block.innerHTML = '<p class="ai-generate-error">No prompt provided.</p>';
    return;
  }

  block.innerHTML = '<p class="ai-generate-loading">Generating content...</p>';

  try {
    const resp = await fetch(AI_GENERATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, format }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || `Request failed: ${resp.status}`);
    }

    const data = await resp.json();

    block.textContent = '';

    if (format === 'html') {
      const wrapper = document.createElement('div');
      wrapper.className = 'ai-generate-content';
      wrapper.innerHTML = data.content;
      block.append(wrapper);
    } else {
      const p = document.createElement('p');
      p.className = 'ai-generate-content';
      p.textContent = data.content;
      block.append(p);
    }
  } catch (err) {
    block.innerHTML = `<p class="ai-generate-error">Failed to generate content: ${err.message}</p>`;
  }
}
