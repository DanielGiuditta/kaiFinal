document.addEventListener('DOMContentLoaded', function() {
    let resetButton = document.getElementById('reset');
    resetButton.style.display = 'none';
    let itemsDisplay = document.getElementById('itemsDisplay');

    // Displays items based on filters or initial data by creating item divs and appending them to the display container.
    function displayItems(items) {
        itemsDisplay.innerHTML = '';
        items.forEach(item => {
            let itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width:200px;height:auto;">`;
            itemsDisplay.appendChild(itemDiv);
        });
        addTheatreModeToImages();
    }

    // Adds event listeners to images for a "theatre mode" view, allowing images to be enlarged and centered on click.
    function addTheatreModeToImages() {
        document.querySelectorAll('.item img').forEach(img => {
            img.addEventListener('click', function() {
                let existingTheatreDiv = document.querySelector('.theatre-mode');
                if (existingTheatreDiv) {
                    existingTheatreDiv.remove();
                } else {
                    let theatreDiv = document.createElement('div');
                    theatreDiv.className = 'theatre-mode';
                    theatreDiv.style.display = 'flex';
                    theatreDiv.style.justifyContent = 'center';
                    theatreDiv.style.alignItems = 'center';
                    let cloneImg = this.cloneNode();
                    cloneImg.style.maxHeight = '80vh';
                    cloneImg.style.maxWidth = '80%';
                    cloneImg.removeAttribute('style');
                    theatreDiv.appendChild(cloneImg);
                    document.body.appendChild(theatreDiv);
                    theatreDiv.addEventListener('click', function() {
                        theatreDiv.remove();
                    });
                }
            });
        });
    }

    // Shows the reset button and attaches functionality to clear filters and reload items.
    function createResetButton() {
        resetButton.style.display = 'inline-flex';
        resetButton.addEventListener('click', function() {
            document.querySelectorAll('.subButton.selected').forEach(button => {
                button.classList.remove('selected'); // Deselect all filters
            });
            fetchAndDisplayItems(); // Reload items without filters
            this.style.display = 'none'; // Hide reset button
        });
    }

    // Fetches items from the server and displays them, applying any active filters.
    function fetchAndDisplayItems() {
        fetch('data.json')
        .then(response => response.json())
        .then(data => {
            applyFilters(data.items);
        })
        .catch(error => console.error('Error loading the items data:', error));
    }

    // Filters items based on selected criteria and updates the display.
    function applyFilters(items) {
        let selectedType = document.querySelector('.subButton[data-type].selected')?.dataset.type;
        let selectedColor = document.querySelector('.subButton[data-color].selected')?.dataset.color;
        let selectedLetter = document.querySelector('.subButton[data-letter].selected')?.dataset.letter;

        let filteredItems = items.filter(item => {
            let matchesType = !selectedType || item.category === selectedType;
            let matchesColor = !selectedColor || item.color.split(', ').includes(selectedColor);
            let matchesLetter = !selectedLetter || item.name.toLowerCase().startsWith(selectedLetter);
            return matchesType && matchesColor && matchesLetter;
        });

        displayItems(filteredItems);
    }

    // Toggles sub-button containers for filters (type, color, letter) based on main button clicks.
    document.querySelectorAll('.mainButton:not(#reset)').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.subButton-container').forEach(container => {
                container.style.display = 'none';
            });
            let targetId = this.id + 'SubButtons';
            document.getElementById(targetId).style.display = 'flex';
        });
    });

    // Manages filter application and style for sub-buttons upon selection.
    document.querySelectorAll('.subButton').forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('closeButton')) {
                // Reset other selections within the same filter category before applying a new filter.
                let currentCategory = this.dataset.type ? 'type' : this.dataset.color ? 'color' : 'letter';
                document.querySelectorAll(`.subButton[data-${currentCategory}].selected`).forEach(otherButton => {
                    otherButton.classList.remove('selected'); // Deselect other buttons in the same category
                });
                this.classList.add('selected'); // Select the clicked button
                // Immediately apply filters upon selection change.
                fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    applyFilters(data.items);
                    createResetButton(); // Ensure reset button visibility
                });
            }
        });
    });

    // Adds functionality to close buttons within filter containers.
    document.querySelectorAll('.closeButton').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });

    fetchAndDisplayItems(); // Initially load and display all items without filters.
});
