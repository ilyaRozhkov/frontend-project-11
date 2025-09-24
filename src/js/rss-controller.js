import axios from 'axios';
import * as yup from 'yup';
import { uniqueId, differenceWith } from 'lodash';
import schemaValidate from './schemaForValidate.js';

import { watchedState } from './state.js';

// получение данных

const validateUrl = (inputValue) => {
  watchedState.inputData = inputValue;

  return schemaValidate
    .validate({ url: inputValue }, { abortEarly: false })
    .then(() => {
      watchedState.validationStatus = 'valid';
      watchedState.errorKey = '';
    })
    .catch((error) => {
      if (error instanceof yup.ValidationError) {
        watchedState.validationStatus = 'invalid';
        // console.log('watchedState.validationStatus:' watchedState.validationStatus);
        const errorKey = error.errors[0];
        console.log(error.errors);
        watchedState.errorKey = errorKey; // Сохраняем в watchedState
        throw new Error(watchedState.errorKey); // Пробрасываем ошибку дальше
      }
    });
  // console.log(watchedState.validationStatus);
};

//выносим отдельно создание proxy

const addProxy = (rssLink) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app');
  urlWithProxy.searchParams.set('url', rssLink);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const getData = (inputValue) => {
  watchedState.inputData = inputValue.trim();
  watchedState.enteredData.push(watchedState.inputData);
  watchedState.dataFetchStatus = 'processing';
  // const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=
  // ${encodeURIComponent(watchedState.inputData.trim())}`;

  const url = addProxy(watchedState.inputData.trim());

  return axios
    .get(url)
    .then((response) => {
      watchedState.dataFetchStatus = 'success';
      const responseData = response.data.contents;
      // console.log('Response Data:', responseData);
      return responseData;
    })
    .catch((error) => {
      watchedState.getDataError = error.message;
      watchedState.dataFetchStatus = 'failed';
      // Бросаем ошибку, чтобы прервать цепочку
      throw error;
    });
};

const parserData = (responseData) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(responseData, 'text/xml');
    const channel = xmlDoc.querySelector('channel');
    const feedName = channel.querySelector('title') ? channel.querySelector('title').textContent : '';
    const feedDescription = channel.querySelector('description') ? channel.querySelector('description').textContent : '';

    const feed = {
      name: feedName,
      description: feedDescription,
      id: uniqueId(),
    };

    const items = channel.querySelectorAll('item');
    const articles = Array.from(items)
      .map((article) => {
        const articleTitle = article.querySelector('title') ? article.querySelector('title').textContent : '';
        const articleDescr = article.querySelector('description') ? article.querySelector('description').textContent : '';
        const articleUrl = article.querySelector('link') ? article.querySelector('link').textContent : '';
        if (!articleUrl) {
          return null;
        }
        return {
          title: articleTitle,
          description: articleDescr,
          url: articleUrl,
          postId: uniqueId(),
          feedId: feed.id,
        };
      })
      .filter((article) => article);
    return { articles, feeds: [feed] };
  } catch (error) {
    watchedState.parsingStatus = 'failed';
    watchedState.parsingError = error.message;
    return null;
  }
};

const updateStateWithParserData = (responseData) => {
  const parsData = parserData(responseData);

  if (!parsData) {
    throw new Error('Parsing failed');
  }

  const { articles, feeds } = parsData;

  watchedState.UI.articles.unshift(...articles);
  watchedState.UI.feeds.unshift(feeds[0]);
  watchedState.parsingStatus = 'success';
};

// обновление данных каждые 5 сек

const updateRssData = async () => {
  const feeds = [...watchedState.enteredData];
  // console.log(`watchedState.UI.articles: ${JSON.stringify(watchedState.UI.articles)}`);
  // console.log(`feeds: ${JSON.stringify(feeds)}`);
  const fetchPromises = feeds.map((feedUrl) => {
    // console.log(`feed: ${JSON.stringify(feed)}`);
    // console.log(`feedUrl: ${JSON.stringify(feedUrl)}`);

    watchedState.dataFetchStatus = 'processing';
    const proxyFeedUrl = addProxy(feedUrl);
    //const proxyUrl = `https://allorigins.hexlet.app/get?disableCache=true&url=
    // ${encodeURIComponent(feedUrl)}`;
    return axios.get(proxyFeedUrl).then((response) => {
      watchedState.dataFetchStatus = 'success';
      const feedData = parserData(response.data.contents);
      // console.log(`feedData: ${JSON.stringify(feedData)}`);
      // prettier-ignore
      const allNewArticles = feedData.articles
        .map((article) => ({ ...article }));
      // console.log(`watchedState.UI.articles: ${JSON.stringify(watchedState.UI.articles)}`);
      // console.log(`allNewArticles: ${JSON.stringify(allNewArticles)}`);
      // prettier-ignore
      const oldArticles = Object.values(watchedState.UI.articles)
        .filter((article) => article.feedId);
      // console.log(`oldArticles: ${JSON.stringify(oldArticles)}`);
      // prettier-ignore
      const newArticles = differenceWith(allNewArticles, oldArticles, (art1, art2) => art1.title === art2.title)
        .map((article) => ({ ...article, id: uniqueId() }));
      console.log(`newArticles: ${JSON.stringify(newArticles)}`);
      if (newArticles.length > 0) {
        watchedState.UI.articles = [...newArticles, ...watchedState.UI.articles];
        // console.log(`watchedState.UI.articles: ${JSON.stringify(watchedState.UI.articles)}`);
        watchedState.updateStatus = 'success';
        // console.log(`watchedState.UI.articles: ${JSON.stringify(watchedState.UI.articles)}`);
      } else {
        watchedState.updateStatus = 'no new articles';
      }
    });
  });
  await Promise.all(fetchPromises).finally(() => {
    setTimeout(() => updateRssData(), 5000);
  });
};
// обратока клика по ссылке

const postManager = {
  markAsRead: (postId) => {
    watchedState.readPosts.readIds.add(postId);
  },
  isRead: (postId) => watchedState.readPosts.readIds.has(postId),
};
// prettier-ignore
export {
  validateUrl,
  getData,
  parserData,
  updateStateWithParserData,
  updateRssData,
  postManager,
};
