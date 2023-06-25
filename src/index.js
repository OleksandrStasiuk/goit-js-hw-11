import Notiflix from 'notiflix';
import ApiService from './api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiService = new ApiService();

const searchFormEl = document.getElementById('search-form');
const btnLoadMore = document.querySelector('.load-more');
const galleryEl = document.querySelector('.gallery');
const options = {
  captionsData: 'alt',
  captionDelay: 250,
};
const lightbox = new SimpleLightbox('.gallery a', { options });

btnLoadMore.classList.add('visually-hidden');

searchFormEl.addEventListener('submit', onFormSubmit);
btnLoadMore.addEventListener('click', onLoadMore);

async function onFormSubmit(evt) {
  evt.preventDefault();
  clearImagesContainer();
  onHide();
  apiService.resetPage();
  apiService.query = evt.currentTarget.elements.searchQuery.value;
  try {
    const { hits, totalHits } = await apiService.fetchImages();
    console.log('full array', hits);
    if (hits.length === 0) {
      onError();
      return;
    }
    appendImagesMarkup(hits);
    lightbox.refresh();
    onAppear();
  } catch (error) {
    console.log(error);
  }
}

async function onLoadMore() {
  try {
    const { hits, totalHits } = await apiService.fetchImages();
    appendImagesMarkup(hits);
    lightbox.refresh();
    onNewRequest(totalHits);
    if (hits.length === 0) {
      onHide();
      onEnd();
    }
  } catch (error) {
    console.log(error);
  }
}

function createMarkup(array) {
  return array
    .map(image => {
      return `<div class="photo-card">
      <a href="${image.largeImageURL}">
  <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" class="min-image"/>
  </a>
  <div class="info">
    <div class="info-item">
      <p><b>Likes</b></p>
      <p class="number">${image.likes}</p>
    </div>
    <div class="info-item">
      <p><b>Views</b></p>
      <p class="number">${image.views}</p>
    </div>
    <div class="info-item">
      <p><b>Comments</b></p>
      <p class="number">${image.comments}</p>
    </div>
    <div class="info-item">
      <p><b>Downloads</b></p>
      <p class="number">${image.downloads}</p>
    </div>
  </div>
</div>`;
    })
    .join('');
}

function appendImagesMarkup(images) {
  galleryEl.insertAdjacentHTML('beforeend', createMarkup(images));
}

function clearImagesContainer() {
  galleryEl.innerHTML = '';
}

function onError() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function onEnd() {
  Notiflix.Notify.warning(
    `We're sorry, but you've reached the end of search results.`
  );
}

function onNewRequest(totalHits) {
  Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
}

function onHide() {
  btnLoadMore.classList.add('visually-hidden');
}

function onAppear() {
  btnLoadMore.classList.remove('visually-hidden');
}
