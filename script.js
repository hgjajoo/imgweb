document.addEventListener('DOMContentLoaded', function () {
    const wordElement = document.getElementById('word');
    const imageContainer = document.getElementById('imageContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const overlay = document.getElementById('overlay');
    const overlayImage = document.getElementById('overlayImage');
    const closeOverlayButton = document.getElementById('closeOverlay');
    const downloadButton = document.getElementById('downloadButton');
    let currentWord = ''; //set default word
    let isDownloading = false;
    let currentImageUrl = '';
    require('dotenv').config();

    fetchImages();

    searchButton.addEventListener('click', function () {
        currentWord = searchInput.value.trim();
        fetchImages();
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    async function fetchImages() {
        try {
            const apiKey = process.env.UNSPLASH_API_KEY;
            const perPage = 20; // per page imgs
            const response = await fetch(`https://api.unsplash.com/search/photos?query=${currentWord}&per_page=${perPage}&client_id=${apiKey}`, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            wordElement.textContent = currentWord;
            displayImages(data.results);
        } catch (error) {
            console.error('Error fetching images:', error.message);
        }
    }

    function displayImages(images) {
        imageContainer.innerHTML = '';
        images.forEach((imageData) => {
            const imageElement = document.createElement('img');
            imageElement.src = imageData.urls.small;
            imageElement.alt = 'Unsplash Image';
            imageElement.className = 'image';
            imageContainer.appendChild(imageElement);
            imageElement.addEventListener('click', function () {
                openOverlay(imageData.urls.regular);
                currentImageUrl = imageData.urls.regular;
            });
        });
    }

    function openOverlay(imageUrl) {
        overlayImage.src = imageUrl;
        overlay.style.display = 'flex';
        closeOverlayButton.addEventListener('click', closeOverlay);
        downloadButton.addEventListener('click', function downloadHandler() {
            if (!isDownloading) {
                isDownloading = true;
                downloadImage(currentImageUrl);
            }
        });
    }

    function closeOverlay() {
        overlay.style.display = 'none';
        overlayImage.src = '';
        isDownloading = false;
        downloadButton.removeEventListener('click', downloadHandler);
    }

    function downloadImage(imageUrl) {
        fetch(imageUrl)
            .then(response => response.blob())
            .then(blob => {
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'downloaded_image.jpg'; //change download name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch(error => console.error('Error fetching image:', error))
            .finally(() => {
                isDownloading = false;
            });
    }
});
