export default function decorate(block) {
  const rows = [...block.children];
  block.textContent = '';

  rows.forEach((row) => {
    const cells = [...row.children];
    const content = cells[0]?.innerHTML || '';
    const alignment = (cells[1]?.textContent || 'left').trim().toLowerCase();
    const margin = (cells[2]?.textContent || '').trim().toLowerCase();
    const amount = parseInt(cells[3]?.textContent || '0', 10);

    const div = document.createElement('div');
    div.className = 'super-text-item';
    div.innerHTML = content;

    if (alignment && alignment !== 'left') {
      div.classList.add(`align-${alignment}`);
    }

    if (amount > 0 && margin) {
      div.classList.add(`${margin}-${amount}`);
    }

    block.append(div);
  });
}
