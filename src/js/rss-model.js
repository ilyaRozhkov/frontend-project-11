// prettier-ignore
import {
  validateUrl,
  getData,
  updateStateWithParserData,
  updateRssData,
} from './rss-controller.js';
// prettier-ignore
import {
  renderErrors,
  renderGetDataError,
  initUI,
  renderListRSS,
  renderParsingError,
  renderFeedRSS,
} from './rss-view.js';
import { state, watchedState } from './state.js';

const rssLogic = async () => {
  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const submitButton = document.querySelector('#input-button');

  if (!form || !input || !submitButton) {
    console.error('Не найдены необходимые элементы DOM');
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const inputValue = input.value.trim();
    submitButton.disabled = true;
    validateUrl(inputValue)
      .then(() => getData(inputValue))
      .then((data) => {
        updateStateWithParserData(data);
      })
      .then(() => {
        initUI(state);
        // console.log('Articles:', watchedState.UI.articles);
        console.log('feeds:', state.UI.feeds);
      })
      .then(() => {
        renderListRSS(state);
        renderFeedRSS(state);
      })
      .catch((error) => {
        if (
          // prettier-ignore
          (Array.isArray(watchedState.getDataError)
          && watchedState.getDataError.includes(error))
          || watchedState.dataFetchStatus === 'failed'
        ) {
          renderGetDataError(watchedState); // ошибка получения данных
        } else if (watchedState.validationStatus === 'invalid') {
          renderErrors(watchedState); // ошибка валидации
        } else if (watchedState.parsingStatus === 'failed') {
          renderParsingError(watchedState);
        }
      })
      .finally(() => {
        submitButton.disabled = false;
      });
  });
  updateRssData();
};

export default rssLogic;
