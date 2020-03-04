//import scripts
import createUpvotes from './upvotes.js';
import createContent from './content.js';
import createFeed from './feed.js';
import createFeedSearch from './displaySearch.js';

//export function which determines when the user has scrolled to bottom of page
function infiniteScroll(ul, apiUrl, authToken, p, n){
  window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
      // you're at the bottom of the page
      p = p + 5; //grab the next 5 posts
      ul = createFeed(ul, apiUrl, authToken, p, n); //append them to feed
    }
  }
}
export default infiniteScroll;
