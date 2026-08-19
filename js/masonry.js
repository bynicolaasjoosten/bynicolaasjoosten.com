const grid = document.querySelector('.masonry');

if (grid) {
  const resizeItem = (item) => {
    const rowHeight = parseInt(getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(grid).getPropertyValue('gap'));
    const img = item.querySelector('img');
    if (!img) return;
    const height = img.getBoundingClientRect().height;
    if (!height) return;
    const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));
    item.style.gridRowEnd = 'span ' + rowSpan;
  };

  const resizeAll = () => {
    grid.querySelectorAll('.masonry__item').forEach(resizeItem);
  };

  grid.querySelectorAll('.masonry__item img').forEach((img) => {
    if (img.complete) {
      resizeItem(img.closest('.masonry__item'));
    } else {
      img.addEventListener('load', () => resizeItem(img.closest('.masonry__item')));
    }
  });

  window.addEventListener('resize', resizeAll);
}
