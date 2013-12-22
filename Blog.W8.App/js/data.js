(function () {
    "use strict";


    var dataPromises = [];
    var blogs = [{
        url: 'http://blog.fferegrino.org/feeds/posts/default',
        title: 'tbd', updated: 'tbd', posts: null,
        acquireSyndication: acquireSyndication, dataPromise: null
    }];
    var blogObject = { blogPosts: null, title: null, subtitle: null, url: null };
    blogObject.blogPosts = new WinJS.Binding.List();
    var list = getBlogPosts();


    //var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) { return item.i; },
        function groupDataSelector(item) { return item; }
    );


    WinJS.Namespace.define("Data", {
        items: blogObject.blogPosts,//groupedItems,
        blog: blogObject
        //groups: groupedItems.groups,
        //getItemReference: getItemReference,
        //getItemsFromGroup: getItemsFromGroup,
        //resolveGroupReference: resolveGroupReference,
        //resolveItemReference: resolveItemReference
    });

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.i, item.title];
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) { return item.group.key === group.key; });
    }

    // Get the unique group corresponding to the provided group key.
    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).i === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    // Get a unique item from the provided string array, which should contain a
    // group key and an item title.
    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }




    function getPosts() {


        // Get the content for each feed in the blogs array
        blogs.forEach(function (blog) {
            blog.dataPromise = blog.acquireSyndication(blog.url);
            dataPromises.push(blog.dataPromise);
        });

        // Return when all asynchronous operations are complete
        return WinJS.Promise.join(dataPromises).then(function () {
            return blogs;
        });
    }

    function acquireSyndication(url) {
        // Call xhr for the URL to get results asynchronously// Call xhr for the URL to get results asynchronously
        return WinJS.xhr({ url: url });
    }

    function getBlogPosts() {
        // Walk the results to retrieve the blog posts
        // Walk the results to retrieve the blog posts
        getPosts().then(function () {
            // Process each blog
            var ix = 0;
            blogs.forEach(function (feed) {
                feed.dataPromise.then(function (articlesResponse) {
                    var articleSyndication = articlesResponse.responseXML;
                    blogObject.title = articleSyndication.querySelector("title").textContent;
                    blogObject.subtitle = articleSyndication.querySelector("subtitle").textContent;
                    blogObject.url = articleSyndication.querySelector("link[rel=alternate]").getAttribute("href");
                    var posts = articleSyndication.querySelectorAll("entry");
                    // Process each blog post
                    for (var postIndex = 0; postIndex < posts.length; postIndex++) {
                        var post = posts[postIndex];

                        // Get the blog title 
                        var postT = post.querySelector("title").textContent;
                        // Get the post id
                        var Id = post.querySelector("id").textContent;

                        var content = toStaticHTML(post.querySelector("content").textContent);

                        // Use the date of the latest post as the last updated date
                        var published = post.querySelector("published");
                        var replies;
                        var link = post.querySelector("link[rel=alternate]").getAttribute("href");
                        if (post.querySelector("link[rel=replies]"))
                            replies = post.querySelector("link[rel=replies]").getAttribute("href");
                        if (published) {
                            // Convert the date for display
                            var date = new Date(published.textContent);
                            var dateFmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(
                               "month.abbreviated day year.full");
                            var postDate = dateFmt.format(date);
                            var monthFmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(
                                "month.abbreviated");
                            var dayFmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(
                                "day");
                            var yearFmt = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter(
                                "year.full");
                            var blogPostMonth = monthFmt.format(date);
                            var blogPostDay = dayFmt.format(date);
                            var blogPostYear = yearFmt.format(date);
                            //var desc = articleSyndication.querySelector("rss > channel > item > description");
                            //feed.description = desc.textContent;
                            // Get the blog posts
                            //getItemsFromXml(articleSyndication, blogPosts, feed);
                        }

                        blogObject.blogPosts.push({
                            i: "" + (ix++),
                            title: postT,
                            date: postDate,
                            url: link,
                            replies: replies,
                            content: content,
                            month: blogPostMonth.toUpperCase(),
                            day: blogPostDay,
                            year: blogPostYear,
                            id: Id
                        });
                    }
                });
            });
        });

        return blogObject.blogPosts;

    }

})();
