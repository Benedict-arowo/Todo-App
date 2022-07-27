const newTodo = document.getElementById('newTodoContent');
const addItemBtn = document.getElementById('addItem');
const todoContainer = document.getElementById('todoContainer');
const editItem = document.getElementById('editItem');
const editItemText = editItem.getElementsByTagName('textarea')[0]
const editDoneBtn = editItem.getElementsByTagName('button')[0]
const tabs = document.querySelectorAll('.tabItem')
const noItems = document.getElementById('noItem');
const editingItemName = document.getElementById('editingItemName')

const err = document.getElementById('err');
const errDisplay = document.getElementById('errDisplay');

const statsItems = document.getElementById('items');
const statsCompleted = document.getElementById('completed');
const statsPending = document.getElementById('pending');
const statsPinned = document.getElementById('pinned');


let currentTab = 'All';
let lastTab = '';
let todoItems = [];
let displayedItems = [];
let test;

const ErrDisplay = (errMsg) => {
    errDisplay.style.display = 'initial'
    err.textContent = errMsg
    setTimeout(() => {
        errDisplay.style.display = 'none'
    }, 3000)
}

newTodo.addEventListener('keydown', e => {
    if (e.key == 'Enter') {
        addItem()
    }
}) 

const editItemFunc = (event) => {
    event = event.target.parentElement.parentElement
    todoItems[event.dataset.id].editItem(event);
    render();
}

tabs.forEach(tab => {
    tab.addEventListener('click', e => {
            lastTab = currentTab;
            tabs.forEach(tab => {
                tab.classList.remove('activeTab');
            })
            currentTab = e.target.textContent;
            e.target.classList.add('activeTab');

            if(!(lastTab == currentTab)) {
                render();
            }
        }
    )}
)



const createNewItem = (itemContent, itemId, itemStatus, pinned) => {
    const newItem = document.createElement('div')
    newItem.classList.add('todoItem')
    newItem.setAttribute('data-id', itemId)
    newItem.innerHTML = `<div class="textContainer">
<p class="todoText">${itemContent}</p>
<div class="completeOverlay ${itemStatus}">
<p>Completed</p>
</div>
</div>
<div class="pin"></div>
<div class="controls">
<button type="button" class="editTodoItem">Edit</button>
<div class="icons">
    <img class='checkMark icon' src="Icons/Check Icon.svg" alt="Check Icon">
    <img class='xMark icon' src="Icons/Cross Icon.svg" alt="Cross Icon">
</div>
</div>
<div class="deleteConfirmation">
    <p>Are you sure you want to delete this item?</p>
<div class="confirmationBtn">
    <button type="button" id="yesBtn">Yes</button>
    <button type="button" id="noBtn">No</button>
</div>
</div>`
    newItem.querySelector('.checkMark').addEventListener('click', e => {
        e = e.target.parentElement.parentElement.parentElement
        displayedItems[e.dataset.id].toggleStatus(e);
    })

    newItem.querySelector('.pin').addEventListener('click', e => {
        e = e.target
        let itemId = e.parentElement.dataset.id
        if (e.style.backgroundColor == 'white' || e.style.backgroundColor == ''){
            e.style.backgroundColor = 'red';
            e.style.border = '2px solid red';
            todoItems[itemId].pin(itemId)
        }
        else {
            e.style.backgroundColor = 'white'
            e.style.border = '2px solid white'
            todoItems[itemId].unpin(itemId)
        }
    })

    newItem.querySelector('.xMark').addEventListener('click', e => {
        let parentItem = e.target.parentElement.parentElement.parentElement
        const deleteConfirmation = parentItem.querySelector('.deleteConfirmation');
        deleteConfirmation.classList.add('show')
        deleteConfirmation.querySelector('#yesBtn').    addEventListener('click', e => {
            todoItems.splice(parentItem.dataset.id, 1);
            render();
        });
        deleteConfirmation.querySelector('#noBtn').addEventListener('click', e => {
            deleteConfirmation.classList.remove('show')
        });
    })

    newItem.querySelector('.editTodoItem').addEventListener('click', editItemFunc)
    todoItems[itemId].id = itemId

    return newItem
}

const todoList = (itemContent, itemStatus, itemId, pinned) => {

    (() => {
        todoItems.push({
            id: itemId,
            content: itemContent,
            itemStatus: itemStatus,
            pinned: pinned,

            deleteItem: function deleteItem() {
                todoItems.splice(itemId, 1);
                saveLocally()
            },
            toggleStatus: (parent) => {
                let item = displayedItems[parent.dataset.id]
                let editItemBtn = parent.querySelector('.editTodoItem')
                if (item.itemStatus == true) {
                    item.itemStatus = false;
                    parent.querySelector('.completeOverlay').classList.remove('show')
                    editItemBtn.classList.remove('completed')
                    editItemBtn.textContent = 'Edit'
                    editItemBtn.addEventListener('click', editItemFunc)
                    
                } 
                else {
                    item.itemStatus = true;
                    parent.querySelector('.completeOverlay').classList.add('show')
                    editItemBtn.classList.add('completed')
                    editItemBtn.textContent = '✔️'
                    editItemBtn.removeEventListener('click', editItemFunc)
                }
                render()
            },
            editItem: (parent) => {
                    let item = displayedItems[parent.dataset.id]
                    editItem.classList.add('show');
                    editingItemName.textContent = `Currently editing item ${parseInt(parent.dataset.id) + 1}`
                    editItem.dataset.id = parent.dataset.id;
                    editItemText.value = item.content;
                    render()
            },
            pin: (id) => {
                displayedItems[id].pinned = true
                let temp = todoItems.splice(id, 1);
                todoItems.unshift(temp[0])
                render()
            },
            unpin: (id) => {
                displayedItems[id].pinned = false
                let temp = todoItems.splice(id, 1)
                todoItems.push(temp[0]);
                render()
            } 
        });
        const newItem = createNewItem(itemContent, itemId, itemStatus, pinned);
        todoContainer.appendChild(newItem);
        render();
    })();        
}

const render = (tabName) => {
        let items;
        if (currentTab == 'Completed') {
            let newItem = todoItems.filter(item => item.itemStatus)
            items = newItem
        }
        else if (currentTab == 'Pending') {
            let newItem = todoItems.filter(item => !item.itemStatus)
            items = newItem
        }
        else {
            items = todoItems
        }

        todoContainer.innerHTML = '';
        if (items.length == 0) {
            noItems.classList.remove('hide')
            if (currentTab == 'All'){
                noItems.textContent = 'You currenlty have no items in your todo list.'
            }
            else {
                noItems.textContent = `There are no items in this tab.`
            }
        }
        else {
            displayedItems = [];
            items.forEach((item) => {
                if (item.pinned == true){
                    displayedItems.unshift(item)
                }
                else {
                    displayedItems.push(item);
                }
            })

            let newid = 0;
            displayedItems.map(item => {
                noItems.classList.add('hide');
                displayedItems.push(item);
                displayedItems[newid].id = newid
                const newItem = createNewItem(item.content, newid, item.status, item.pinned)
                let editItemBtn = newItem.querySelector('.editTodoItem')
                if (item.itemStatus) {
                    newItem.querySelector('.completeOverlay').classList.add('show')
                    editItemBtn.classList.add('completed')
                    editItemBtn.textContent = '✔️'
                    editItemBtn.removeEventListener('click', editItemFunc)
                }
                if (item.pinned) {
                    let temp = newItem.children[1]
                    temp.style.backgroundColor = 'red';
                    temp.style.border = '2px solid red';
                }

                todoContainer.appendChild(newItem)
                newid++
            })
    }
    statsItems.textContent = todoItems.length
    statsCompleted.textContent = todoItems.filter(items => items.itemStatus).length
    statsPending.textContent = todoItems.filter(items => !items.itemStatus).length
    statsPinned.textContent = todoItems.filter(items => items.pinned).length;
    saveLocally()
}
    



editDoneBtn.addEventListener('click', e => {
    let item = todoItems[editItem.dataset.id]
    let newText = editItemText.value

    if (newText.length < 3) {
        return ErrDisplay('Input length is too low!');
    }
    item.content = newText 
    render();
    editItem.classList.remove('show');    
})

addItemBtn.addEventListener('click', e => addItem())

const addItem = () => {
    if (newTodo.value.length <= 3) {
        let err = 'Input length is too low!'
        ErrDisplay(err)
    }
    else if (newTodo.value.length >= 350){
        let err = 'Input length has exceeded 350 characters'
        ErrDisplay(err);
    }
    else {
        let itemContent = newTodo.value;
        todoList(itemContent, false, todoItems.length, false);
        newTodo.value = '';

        if (addTodoSection.classList.contains('showMenu')) {
            addTodoSection.classList.remove('showMenu')    
            todoSection.style.display = 'block'
        }
    }
    saveLocally()
}


const saveLocally = () => {
    localStorage.setItem('todoItems', JSON.stringify(todoItems))
}


if (localStorage.getItem('todoItems')) {
    let savedItems = JSON.parse(localStorage.getItem('todoItems'));
    savedItems.map(item => {
        item.id = todoItems.length;
        let {content, itemStatus, pinned} = item;
        if (!pinned) {
            pinned = false
        }
        todoList(content, itemStatus, todoItems.length, pinned);
    })
    render()
}

const menu = document.getElementById('menu')
const addTodoSection = document.getElementById('newTodoSection')
const todoSection = document.getElementById('todoSection');
const one = document.getElementById('1'); 
const two = document.getElementById('2'); 
const three = document.getElementById('3'); 


menu.addEventListener('click', e => {
    if (addTodoSection.classList.contains('showMenu')){
        addTodoSection.classList.remove('showMenu')    
        todoSection.style.cssText = 'display: initial;';
        one.style.cssText = ''
        two.style.cssText = ''
        three.style.cssText = ''
    }
    else {
        addTodoSection.classList.add('showMenu')    
        todoSection.style.cssText = 'display: none;';
        one.style.cssText = 'transform: rotate(125deg); position: absolute; top: 15px; left: -6px;'
        two.style.cssText = 'display: none;'
        three.style.cssText = 'transform: rotate(-130deg); position: absolute; top: 15px; left: -6px;'
    }
})

// window.addEventListener('resize', e => {
//     if (window.innerWidth < 1062) {
//         addTodoSection.classList.remove('showMenu')    
//         todoSection.style.display = 'block'
//     }
// })