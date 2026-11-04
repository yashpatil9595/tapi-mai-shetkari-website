const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-nav');

menuButton.addEventListener('click', () => {
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isExpanded));
  menuButton.setAttribute('aria-label', isExpanded ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !isExpanded);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  });
});

document.querySelector('#year').textContent = new Date().getFullYear();

const searchField = document.querySelector('#product-search');
const sectionFilter = document.querySelector('#product-section');
const catalog = document.querySelector('#product-catalog');
const catalogCount = document.querySelector('#product-count');
const productSections = ['IFFCO MC', 'Enjochem', 'Other stock'];
const expandedSections = new Set();
const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function renderCatalog() {
  const query = searchField.value.trim().toLocaleLowerCase();
  const selectedSection = sectionFilter.value;
  const filtered = (window.productCatalog || []).filter((product) => {
    const matchesText = product.name.toLocaleLowerCase().includes(query);
    const matchesSection = selectedSection === 'all' || product.section === selectedSection;
    return matchesText && matchesSection;
  });
  catalogCount.textContent = query || selectedSection !== 'all'
    ? `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`
    : `${filtered.length} products listed across three supplier sections`;

  if (!filtered.length) {
    catalog.innerHTML = '<p class="catalog-empty">No matching products. Try another name or call us to ask.</p>';
    return;
  }

  catalog.innerHTML = productSections.map((section) => {
    const matches = filtered.filter((product) => product.section === section);
    if (!matches.length) return '';
    const showAll = Boolean(query) || expandedSections.has(section);
    const visible = showAll ? matches : matches.slice(0, 8);
    const cards = visible.map((product) => {
      const image = product.image
        ? `<img class="product-photo" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.imageAlt || `${product.name} product photo`)}" loading="lazy">`
        : '';
      return `
        <article class="product-card${image ? ' with-image' : ''}">
          ${image}
          <div class="product-copy"><h4>${escapeHTML(product.name)}</h4>
            <span class="product-price">${rupees.format(product.price)} <small>report rate</small></span>
          </div>
        </article>`;
    }).join('');
    const moreButton = !query && matches.length > visible.length
      ? `<button class="catalog-more" type="button" data-section="${escapeHTML(section)}">Show all ${matches.length} products</button>`
      : '';
    return `<section class="catalog-section" aria-label="${escapeHTML(section)} products">
      <h3>${escapeHTML(section)} <span>${matches.length} item${matches.length === 1 ? '' : 's'}</span></h3>
      <div class="product-grid">${cards}</div>${moreButton}
    </section>`;
  }).join('');

  catalog.querySelectorAll('.catalog-more').forEach((button) => {
    button.addEventListener('click', () => {
      expandedSections.add(button.dataset.section);
      renderCatalog();
    });
  });
}

searchField.addEventListener('input', renderCatalog);
sectionFilter.addEventListener('change', renderCatalog);
renderCatalog();
