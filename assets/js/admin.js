document.addEventListener('DOMContentLoaded', function() {
    //////// Toggle between table and editor views
    const addNewBtn = document.getElementById('cg-add-new');
    const gridList = document.querySelector('.cg-grid-list');
    const gridEditor = document.querySelector('.cg-grid-editor');

    if (addNewBtn && gridList && gridEditor) {
        addNewBtn.addEventListener('click', function() {
            gridList.style.display = 'none';
            gridEditor.style.display = 'block';
            resetEditor();
        });

        document.getElementById('cg-cancel-edit').addEventListener('click', function() {
            gridList.style.display = 'block';
            gridEditor.style.display = 'none';
        });
    }

    function resetEditor() {
        document.getElementById('cg-grid-name').value = '';
        document.getElementById('cg-grid-slug').value = '';
        document.getElementById('cg-selected-categories').innerHTML = '';
        
        // Reset settings to defaults
        document.getElementById('cg-desktop-columns').value = '4';
        document.getElementById('cg-mobile-columns').value = '2';
        document.getElementById('cg-carousel-mobile').checked = true;
        document.getElementById('cg-image-size').value = 'medium';
    }

    // Media uploader
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cg-upload-image')) {
            e.preventDefault();
            const button = e.target;
            const input = button.nextElementSibling;
            const preview = input.nextElementSibling;
            
            const frame = wp.media({
                title: 'Select Category Image',
                button: { text: 'Use this image' },
                multiple: false
            });
            
            frame.on('select', function() {
                const attachment = frame.state().get('selection').first().toJSON();
                input.value = attachment.url;
                preview.style.display = 'block';
                preview.querySelector('img').src = attachment.url;
            });
            
            frame.open();
        }
    });
    
    // Category selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cg-add-category')) {
            const categoryItem = e.target.closest('li');
            const categoryId = categoryItem.dataset.id;
            const categoryName = categoryItem.querySelector('.cg-category-name').textContent;
            
            const selectedItem = document.createElement('li');
            selectedItem.dataset.id = categoryId;
            selectedItem.innerHTML = `
                <div class="cg-category-meta">
                    <span class="cg-category-name">${categoryName}</span>
                    <button class="button cg-remove-category">Remove</button>
                </div>
                <div class="cg-category-fields">
                    <div class="cg-form-group">
                        <label>Custom Image URL</label>
                        <button class="button cg-upload-image">Upload</button>
                        <input type="text" class="cg-category-image regular-text">
                        <div class="cg-image-preview" style="display:none;">
                            <img src="" style="max-width:100px;">
                        </div>
                    </div>
                    <div class="cg-form-group">
                        <label>Custom Link URL</label>
                        <input type="text" class="cg-category-link regular-text" 
                               placeholder="Leave blank for default category link">
                    </div>
                    <div class="cg-form-group">
                        <label>Alt Text</label>
                        <input type="text" class="cg-category-alt regular-text" 
                               placeholder="Image alt text">
                    </div>
                </div>
            `;
            
            document.getElementById('cg-selected-categories').appendChild(selectedItem);
        }
        
        if (e.target.classList.contains('cg-remove-category')) {
            e.target.closest('li').remove();
        }
    });
    
    // Save grid handler
    // Replace everything from:
// const saveButton = document.getElementById('cg-save-grid');
// if (saveButton) {
//     saveButton.addEventListener('click', function() {
//         ...
//     });
// }
// To the end of the XMLHttpRequest code

// With this updated version:
const saveButton = document.getElementById('cg-save-grid');
if (saveButton) {
    saveButton.addEventListener('click', async function() {
        const saveButton = this;
        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            const formData = new FormData();
            formData.append('action', 'cg_save_grid');
            formData.append('nonce', cg_admin_vars.nonce);
            formData.append('grid_id', document.querySelector('.cg-grid-editor').dataset.id || '');
            formData.append('name', document.getElementById('cg-grid-name').value);
            formData.append('slug', document.getElementById('cg-grid-slug').value);
            formData.append('categories', JSON.stringify(getCategoriesData()));
            formData.append('settings', JSON.stringify(getSettingsData()));

            const response = await fetch(cg_admin_vars.ajax_url, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            if (!data.success) throw new Error(data.data);

            alert('Grid saved successfully');
            window.location.reload();
        } catch (error) {
            console.error('Save error:', error);
            alert(`Save failed: ${error.message}`);
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = 'Save Grid';
        }
    });

    function getCategoriesData() {
        return Array.from(document.querySelectorAll('#cg-selected-categories li')).map(item => ({
            id: item.dataset.id,
            image: item.querySelector('.cg-category-image').value,
            link: item.querySelector('.cg-category-link').value,
            alt: item.querySelector('.cg-category-alt').value
        }));
    }

    function getSettingsData() {
        return {
            desktop_columns: document.getElementById('cg-desktop-columns').value,
            mobile_columns: document.getElementById('cg-mobile-columns').value,
            carousel_mobile: document.getElementById('cg-carousel-mobile').checked,
            image_size: document.getElementById('cg-image-size').value
        };
    }
}
    
    // Generate slug from name
    const nameInput = document.getElementById('cg-grid-name');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const slugInput = document.getElementById('cg-grid-slug');
            if (!slugInput.value) {
                slugInput.value = this.value.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^\w\-]+/g, '')
                    .replace(/\-\-+/g, '-')
                    .replace(/^-+/, '')
                    .replace(/-+$/, '');
            }
        });
    }
});