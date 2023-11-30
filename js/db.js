
// sync browser db with firebase cloud after offline
db.enablePersistence()
.catch(err=>{
    if(err.code == 'failed-precondition'){
        // Probably multiple tabs opened
        console.log('persistence failed');
    }else if(err.code == 'unimplemented'){
        // lack of browser support
        console.log('persistence not available')
    }
});

db.collection('recipes').onSnapshot(snapshot=>{
    // console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
        console.log(change.type);

        if(change.type === 'added'){
            renderRecipe(change.doc.data(), change.doc.id)
        }

        if(change.type === 'removed'){
            removeRecipe(change.doc.id)
        }

        if(change.type === 'modified'){
            updateRecipe(change.doc.data(), change.doc.id);
        }
    });
})

const form = document.querySelector('form');
form.addEventListener('submit', evt=>{
    evt.preventDefault();

    const recipe = {
        title : form.title.value,
        ingredients : form.ingredients.value
    }

    db.collection('recipes').add(recipe)
    .catch(err=>{
        console.log(err);
    })

    form.title.value = '';
    form.ingredients.value = '';
})

const recipeContainer = document.querySelector('.recipes')
recipeContainer.addEventListener('click', evt=>{
    if(evt.target.tagName === 'I'){
        if(evt.target.innerText == 'delete_outline'){
            const id = evt.target.getAttribute('data-id');
            db.collection('recipes').doc(id).delete()
            .catch(err=>console.log(err))
        }

        if(evt.target.innerText === 'edit'){
            let panelId = evt.target.getAttribute('data-id');
            let panel = document.querySelector(`.card-panel[data-id='${panelId}']`)

            let title = panel.querySelector('.recipe-details .recipe-title').innerText;
            let ingredients = panel.querySelector('.recipe-details .recipe-ingredients').innerText;

            let formEl = document.querySelector('form');
            formEl.elements['title'].value = title;
            formEl.elements['ingredients'].value = ingredients;
            formEl.elements['submit-btn'].innerText = "Edit";

            document.querySelector('.add-recipe-btn').click();
        }
    }
})