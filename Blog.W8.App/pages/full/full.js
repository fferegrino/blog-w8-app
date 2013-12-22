// For an introduction to the Page Control template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232511
(function () {
    "use strict";
    var post;
    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();

    WinJS.UI.Pages.define("/pages/full/full.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.


        ready: function (element, options) {
            // TODO: Initialize the page here.

            post = options && options.post ? options.post : Data.items.getAt(0);
            element.querySelector(".titlearea .pagetitle").textContent = post.title;
            element.querySelector("article .item-content").innerHTML = post.content;
            element.querySelector("article .item-date").innerHTML = post.date;

            var appbar = document.getElementById('appbar');
            var appbarCtrl = appbar.winControl;
            appbarCtrl.showCommands(["nav"], false);
            appbarCtrl.showCommands(["homeB"], false);
            appbarCtrl.hideCommands(["shareB"], false);

            document.getElementById('nav').addEventListener("click", verCompleto, false);
            //document.getElementById('shareB').addEventListener("click", showShareUI, false);
            document.getElementById('homeB').addEventListener("click", goToHomePage, false);

            dataTransferManager.addEventListener("datarequested", shareTextHandler, false);
        },



        unload: function () {
            // TODO: Respond to navigations away from this page.
        },

        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            // TODO: Respond to changes in viewState.
        }
    });



    function verCompleto() {
        var url = new Windows.Foundation.Uri(post.url);
        Windows.System.Launcher.launchUriAsync(url);
    }

    function goToHomePage(eventInfo) {
        WinJS.Navigation.navigate("/pages/items/items.html");
    }

    function shareTextHandler(e) {
        var request = e.request;
        request.data.properties.title = post.title;
        request.data.properties.description = "Comparte este post";
        request.data.setText("Mira el post " + post.title + " " + post.url);
        
    }

    function showShareUI() {
        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    }

})();
