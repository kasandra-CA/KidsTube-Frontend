// graphqlQueries.js
import { graphqlRequest } from './graphqlClient.js';

export async function getPlaylistsByRestrictedUser(userId) {
  const query = `
    query ($userId: ID!) {
      restrictedUserPlaylists(userId: $userId) {
        _id
        name
        videos {
          _id
          name
          url
        }
      }
    }
  `;
  return graphqlRequest(query, { userId });
}

export async function searchVideos(userId, searchText) {
  const query = `
    query ($userId: ID!, $text: String!) {
      searchVideosByText(userId: $userId, text: $text) {
        _id
        name
        url
        description
      }
    }
  `;
  return graphqlRequest(query, { userId, text: searchText });
}

export async function getVideosByUser(userId) {
    const query = `
      query ($userId: ID!) {
        videosByUser(userId: $userId) {
          _id
          name
          url
          description
        }
      }
    `;
    return graphqlRequest(query, { userId });
  }  