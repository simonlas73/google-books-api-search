/// USER INTERACTION functions (jQuery) ///

$(function() {

    var query,
        volume_id,
        title,
        thumbnail_src;

    // Get number of books in cart on page reload
    getCartSize();

    // Start search if input text is more than 2 characters
    $("#search").keyup(function() {
        query = $(this).val();
        if (query.length >= 3) {
            beginSearch(query);
        }
    });

    // Display book description page if 'Show description' is pressed
    $(document).on('click', '.show-book', function() {
        volume_id = $(this).attr('data-volumeid');
        getBookInfo(volume_id);
    });

    // Add book to cart if 'Add to Cart' is pressed
    $(document).on('click', '.add-to-cart', function() {
        volume_id = $(this).attr('data-volumeid');
        title = $("#title_" + volume_id).html();
        thumbnail_src = $("#tn_" + volume_id).attr('src');
        addToCart(volume_id, title, thumbnail_src);
        $('#myModal').modal();
    });

    // Display cart if 'Your Cart' is clicked
    $(".cart").on('click', function() {
        $("#myModal").modal("hide");
        displayCart();
    });

    // Clear cart if 'Empty Cart' button is pressed
    $(document).on('click', '.empty-cart', function() {
        emptyCart();
        displayCart();
    });

});

/// BUSINESS LOGIC functions (plain JS) ///

// Wrapping function to prevent creating globals
(function(results, cart_sum, item, button, thumbnail) {
    var results = document.getElementById("results"),
        cart_sum = document.getElementById("cart_sum"),
        item,
        button,
        thumbnail;
})();

// Check whether Web Storage can be used
if (!storageAvailable('localStorage')) {
    document.getElementById("cart-cont").innerHTML = "Your Cart: Sorry, your browser does not support Web Storage.";
}

// Dynamically create script element that loads search results from API.
// Once loaded, handleResults is automatically called with the result set.
function beginSearch(query) {
    var url = 'https://www.googleapis.com/books/v1/volumes?q=title:' +
        encodeURIComponent(query) + '&callback=handleResults';
    var script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Handle API response and load the result set
function handleResults(response) {
    results.innerHTML = "";
    if (response.items === undefined) {
        results.innerHTML = "No results";
    } else {
        for (var i = 0; i < response.items.length; i++) {
            item = response.items[i];
            if (item.volumeInfo.imageLinks !== undefined) {
                thumbnail = item.volumeInfo.imageLinks.thumbnail;
            }
            results.innerHTML += "<div class='row book'>" +
                "<div class='col-sm-2'><img src='" + thumbnail + "'></div>" +
                "<div class='col-sm-10'><p class='authors'>" + item.volumeInfo.authors + "</p>" +
                "<a class='title show-book' data-volumeid='" + item.id + "'>" + item.volumeInfo.title + "</a>" +
                "<p class='description'>" + textTruncate(item.volumeInfo.description) + "</p>" +
                "<a role='button' class='btn btn-primary show-book' data-volumeid='" + item.id + "'>Show Details</a>" +
                "</div>" +
                "</div><hr>";
        }
    }
}

// Dynamically create script element that loads book data from API.
// Once data loaded, showBookInfo is automatically called to show book data.
function getBookInfo(volume_id) {
    var url = 'https://www.googleapis.com/books/v1/volumes?q=id:' +
        volume_id + '&callback=showBookInfo';
    var script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
}

// Show details of a book
function showBookInfo(response) {
    var item = [];
    results.innerHTML = "";
    if (response.items === undefined) {
        results.innerHTML = "No results";
    } else {
        item = response.items[0];
        button = "<a role='button' class='btn btn-success show-book' data-volumeid='" + item.id + "'>Add to Cart</a>";
        results.innerHTML += "<div class='row book'>" +
            "<div class='col-sm-2'><img id='tn_" + item.id + "' src='" + item.volumeInfo.imageLinks.thumbnail + "'></div>" +
            "<div class='col-sm-10'>" +
            "<p class='title' id='title_" + item.id + "'>" + item.volumeInfo.title + "</p>" +
            "<p>Author(s): " + item.volumeInfo.authors + "</p>" +
            "<p>Publisher: " + item.volumeInfo.publisher + "</p>" +
            "<p>Published: " + item.volumeInfo.publishedDate + "</p>" +
            "<p class='description'>" + item.volumeInfo.description + "</p>" +
            "<br><a role='button' class='btn btn-success add-to-cart' data-volumeid='" + item.id + "'>Add to Cart</a>" +
            "</div>" +
            "</div>";
    }
}

// Truncate book description if too long
function textTruncate(str, len, ending) {
    if (len === null) {
        len = 500;
    }
    if (ending === null) {
        ending = "...";
    }
    if (str && str.length > len) {
        return str.substring(0, len - ending.length) + ending;
    } else {
        return str;
    }
}

// Number of books in the cart
function getCartSize() {
    var cart = localStorage.getItem("items"),
        cartObj,
        cart_size;
    if (cart && cart.length > 0) {
        cartObj = JSON.parse(cart);
        cart_size = cartObj.length + " item(s)";
    } else {
        cart_size = "Your cart is empty";
    }
    cart_sum.innerHTML = cart_size;
}

// Add book to cart
function addToCart(volume_id, title, thumbnail_src) {
    var cart = localStorage.getItem("items"),
        item = {
            volume_id: volume_id,
            title: title,
            thumbnail_src: thumbnail_src
        },
        items = [];
    if (cart && cart.length > 0) {
        items = JSON.parse(cart);
    }
    items.push(item);
    localStorage.setItem("items", JSON.stringify(items));
    getCartSize();
}

// Display cart
function displayCart() {
    var cart = localStorage.getItem("items"),
        content = "<h3>Your cart:</h3>",
        x,
        item = [];
    results.innerHTML = "";
    if (cart && cart.length > 0) {
        x = JSON.parse(cart);
        for (var i = 0; i < x.length; i++) {
            item = x[i];
            content += "<br><div class='row'>" +
                "<div class='col-sm-2'>" +
                "<img src='" + item.thumbnail_src + "' class='img-responsive' width='50'>" +
                "</div>" +
                "<div class='col-sm-8'>" +
                "<h3><a class='show-book' data-volumeid='" + item.volume_id + "'>" + item.title + "</a></h3>" +
                "</div>" +
                "<div class='col-sm-2'>" +
                "<button class='btn btn-primary show-book' data-volumeid='" + item.volume_id + "'>Show Description</button>" +
                "</div>" +
                "</div><hr>";
        }
        content += "<button class='btn btn-default empty-cart'>Empty Cart</button>";
    } else {
        content += "<p>Your cart is empty.</p>";
    }
    results.innerHTML = content;
}

// Make cart empty and refresh item counter
function emptyCart() {
    window.localStorage.clear();
    getCartSize();
}

// Test whether we can use localStorage
function storageAvailable(type) {
    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return e instanceof DOMException && (
                // everything except Firefox
                e.code === 22 ||
                // Firefox
                e.code === 1014 ||
                // test name field too, because code might not be present
                // everything except Firefox
                e.name === 'QuotaExceededError' ||
                // Firefox
                e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage.length !== 0;
    }
}
