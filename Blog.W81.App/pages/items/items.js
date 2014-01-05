(function () {
    "use strict";

    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var ui = WinJS.UI;
    var dataTransferManager = Windows.ApplicationModel.DataTransfer.DataTransferManager.getForCurrentView();
    var blog;

    ui.Pages.define("/pages/items/items.html", {
        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            blog = Data.blog;
            var listView = element.querySelector(".itemslist").winControl;
            listView.itemDataSource = blog.blogPosts.dataSource;
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);
            var appbar = document.getElementById('appbar');
            var appbarCtrl = appbar.winControl;
            appbarCtrl.hideCommands(["nav"], false); appbarCtrl.hideCommands(["commentB"], false);
            appbarCtrl.hideCommands(["homeB"], false);
            appbarCtrl.showCommands(["shareB"], false);
            

            this._initializeLayout(listView, Windows.UI.ViewManagement.ApplicationView.value);
            listView.element.focus();


            document.getElementById('shareB').addEventListener("click", showShareUI, false);

            dataTransferManager.addEventListener("datarequested", shareTextHandler, false);
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".itemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    var firstVisible = listView.indexOfFirstVisible;
                    this._initializeLayout(listView, viewState);
                    if (firstVisible >= 0 && listView.itemDataSource.list.length > 0) {
                        listView.indexOfFirstVisible = firstVisible;
                    }
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.layout = new ui.ListLayout();
            } else {
                listView.layout = new ui.GridLayout();
            }
        },

        _itemInvoked: function (args) {
            var post = blog.blogPosts.getAt(args.detail.itemIndex);
            WinJS.Navigation.navigate("/pages/full/full.html", { post: post });
        }
    });

    function shareTextHandler(e) {
        var request = e.request;
        request.data.properties.title = blog.title;
        request.data.properties.description = "Comparte este blog";
        request.data.setText("Mira " + blog.title + " " + blog.url);
    }

    function showShareUI() {
        Windows.ApplicationModel.DataTransfer.DataTransferManager.showShareUI();
    }
})();
