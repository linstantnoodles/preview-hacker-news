let commentsCache = {};
let storyTableElement = document.querySelector("table.itemlist");

storyTableElement.addEventListener("mouseover", function(event) {
  if (event.target && event.target.nodeName == "A" && event.target.text.indexOf("comment") >= 0 && !event.target.classList.contains("hoverhackernews-link")) {
    let timer = window.setTimeout(() => {
      hideAllComments();
      let trow = event.target.closest("tr").previousSibling;
      let href = trow.getElementsByClassName("storylink")[0];
      let storyId = trow.getAttribute("id");
      if (commentsCache[storyId]) {
        let toDelete = trow.getElementsByClassName("hoverhackernews-comments");
        for (let i = 0; i < toDelete.length; i ++) {
          toDelete[i].style.display = "";
          toDelete[i].style.left = `${event.target.getBoundingClientRect().left}px`;
          toDelete[i].style.top = `${event.target.getBoundingClientRect().top + window.scrollY}px`;
        }
      } else {
        commentsCache[storyId] = {};
        getStoryTopComments(storyId, 3).then((data) => {
          commentsCache[storyId]["data"] = data;
          let itemElement = commentsHtmlEl(event.target.text, event.target.getAttribute('href'), commentsCache[storyId]["data"], event.target);
          itemElement.addEventListener("mouseleave", function(event) {
            event.target.style.display = "none";
          });
          trow.appendChild(itemElement);
          event.target.style.textDecoration = "underline";
          event.target.style.textDecorationColor = "white";
        })
      }
    }, 500);
    event.target.addEventListener("mouseleave", (event) => {
      clearTimeout(timer);
    })
  }
});

function getStoryTopComments(story_id, count) {
  let url = `https://hacker-news.firebaseio.com/v0/item/${story_id}.json?print=pretty`;
  return fetch(url).then(response => {
    return response.json();
  }).then(data => {
    let kids = data['kids'];
    if (!kids) {
      return [];
    }
    let top = kids.slice(0, count);
    return Promise.all(
      top.map((comment_id) => {
        let commentUrl = `https://hacker-news.firebaseio.com/v0/item/${comment_id}.json?print=pretty`;
        return fetch(commentUrl)
          .then(response => {
            return response.json();
          }).then(data => {
            return data;
        });
    }))
  })
}

function commentsHtmlEl(title, url, comments, el) {
    let itemHtml = '<td class="hoverhackernews-comments">';
    itemHtml += `<div><a href="${url}" class="hoverhackernews-link">${title}</a></div><br/>`;
    if (comments.length) {
     if (comments[0])  {
        itemHtml += `<div><span>${comments[0]["by"]}</span><hr><p>${comments[0]["text"]}</p></div>`;
     }
     if (comments[1]) {
        itemHtml += `<div><span>${comments[1]["by"]}</span><hr><p>${comments[1]["text"]}</p></div>`;
     }
     if (comments[2]) {
        itemHtml += `<div><span>${comments[2]["by"]}</span><hr><p>${comments[2]["text"]}</p></div>`;
     }
    } else {
      itemHtml += '<div><p>No comments yet</p></div>';
    }
    itemHtml += `<div><p><a href="${url}">...</a></p></div></td>`;
    let template = document.createElement('template');
    itemHtml = itemHtml.trim();
    template.innerHTML = itemHtml;
    let node = template.content.firstChild;
    node.style.zIndex = 100;
    node.style.position = "absolute";
    node.style.left = `${el.getBoundingClientRect().left}px`;
    node.style.top = `${el.getBoundingClientRect().top + window.scrollY}px`;
    node.style.background = "#f6f6ef";
    node.style.padding = "10px";
    node.style.color = "black";
    node.style.width = "50%";
    node.style.height = "300px";
    node.style.overflow = "scroll";
    return node;
}

function hideAllComments() {
  let elements = document.getElementsByClassName("hoverhackernews-comments");
  for (let i = 0; i < elements.length; i++)  {
    elements[i].style.display = "none";
  }
}