function obj_reverse(obj) {
    new_obj= {}
    rev_obj = Object.keys(obj).reverse();
    rev_obj.forEach(function(i) { 
      new_obj[i] = obj[i];
    })
    return new_obj;
}

export function note (opsions={}){
    const notesStorage = {
    }

    const noteHTML = `
        <div class="topmenu">
            <div class="textchanginmenu">
                <button id="btn_bold" title="Bold text"><strong data-btn="bold" >A</strong></button>
                <button id="btn_italics" title="Italics text"><i data-btn="italics">B</i></button>
                <button id="btn_underlined" title="Underlined text"><u data-btn="underlined">C</u></button>
                <button id="btn_crossed" title="Crossed out text"><strike data-btn="crossed" >T</strike></button>
                <button id="btn_list" title="Add lIst">&#9776;</button>
                <button id="btn_photo" title="Add photo">&#128444;</button>
                <input type="file" multiple=${opsions.multi} accept=${opsions.accept.join(',')}>
            </div>
            <div class="btn_close" >&times;</div>
        </div>
        <div class="main">
            <div class="photos"></div>
            <div class="note" spellcheck="false" contenteditable="true"></div>
        </div>
        `
    const liTemplate = id =>{return `
        <li data-id="${id}" data-fav=${notesStorage[id][3]}>
            <p data-type="note">${notesStorage[id][0]}</p>
            <div class="slidebar">
                <p title="Edit title" class="editbtn" data-type="edit">&#9999;</p><p title="Add to favourites" class"favouritesbtn" data-type="favourites">&#9733;</p ><p title="Delete" class="deletebtn" data-type="delete">&#128465;</p>
            </div>
            <span>&#9733;</span>
        </li>`
    }

    const allnotes = document.querySelector('#allnotes')
    const insidepage = document.querySelector('#insidenotes')
    const notelist = allnotes.querySelector('ul')
    const addbtn = allnotes.querySelector('button')
    const noteName = allnotes.querySelector('input')
    const searchBtn = document.querySelector('.searchBtn')
    const searchInput = document.querySelector('.searchInput')
    

    const renderNotes = () =>{
        for(let id in obj_reverse(notesStorage)){
            if(notesStorage[id][3]){
                notelist.insertAdjacentHTML('beforeend',liTemplate(id))
            }else{
                setTimeout(() => {
                    notelist.insertAdjacentHTML('beforeend',liTemplate(id))
                }, 10);
            }
        }
    }

    const renderPhotos = src =>{
        const photoLine = insidepage.querySelector('.photos')
        if(photoLine.childNodes.length <=27){
           photoLine.insertAdjacentHTML('beforeend',`<div style="background-image:url(${src})"><p data-sort="open"><span data-sort="delete">&#128465;</span></p></div>`) 
        }
    }

    const createNote = title => {
        const id = Math.random().toString(16).slice(2)
        notesStorage[id] = [`${title}`,[],'',false]
        return liTemplate(id)
    }
    
    const noteAddHandler = () =>{
        event.preventDefault()
        if(noteName.value.length<5) return

        notelist.insertAdjacentHTML('beforeend',createNote(noteName.value));

        noteName.value = ''
    }

    const uploadHandler = id =>{
        if(!event.target.files.length){
            return
        }
        files = Array.from(event.target.files)
        files.forEach(file => {
            if(!file.type.match('image')){
                return
            }
            const reader = new FileReader()
            reader.onload = ev => {
                const src = ev.target.result
                notesStorage[id][1].push(src)
                renderPhotos(src)
            }
            reader.readAsDataURL(file)
        })
    }

    const photoHandler = () =>{
        const {sort} = event.target.dataset
        const photoDiv = event.target.closest('div')
        const noteId = insidepage.dataset.id
        const photo = photoDiv.style.getPropertyValue('background-image').slice(5,-2)
        if(sort === 'delete'){
            notesStorage[noteId][1] = notesStorage[noteId][1].filter(el =>el !== photo)
            photoDiv.remove()
        }
        if(sort === 'open'){
            console.log(event.target)
        }
        
    }

    const searchHandler = () =>{
        event.preventDefault()
        const findWord =  searchInput !=='' ? new RegExp(`${searchInput.value}`,'i') : null
        
        for(let id in notesStorage){
            allnotes.querySelector(`[data-id="${id}"]`).style.display = 'none'
            if(notesStorage[id][0].match(findWord)) {
                allnotes.querySelector(`[data-id="${id}"]`).style.display = 'list-item'
            }
        }
       

    }
    
    const editTextInside = () =>{
        document.execCommand('insertBrOnReturn')
        const bold = insidepage.querySelector('#btn_bold')
        const italics = insidepage.querySelector('#btn_italics')
        const underlined = insidepage.querySelector('#btn_underlined')
        const crossed = insidepage.querySelector('#btn_crossed')
        const list = insidepage.querySelector('#btn_list')
        

        
        bold.addEventListener('click',()=>{document.execCommand('bold')})
        italics.addEventListener('click',()=>{document.execCommand('italic')})
        underlined.addEventListener('click',()=>{document.execCommand('underline')})
        crossed.addEventListener('click',()=>{document.execCommand('strikeThrough')})
        list.addEventListener('click',()=>{document.execCommand('insertUnorderedList')})
    }

    const actionWithNote = () =>{
        const {id} = event.target.closest('li').dataset
        const li = allnotes.querySelector(`[data-id="${id}"]`)
        const {type} = event.target.dataset

        if(!type ){
            return
        }

        if(type === 'note'){
            insidepage.innerHTML = '' 
            searchInput.value = ''
            notelist.querySelectorAll('li').forEach(el => {
                el.classList.remove('selected')
                el.style.display = 'list-item'
            })
            li.classList.add('selected')

            insidepage.setAttribute('data-id',`${id}`)
            insidepage.insertAdjacentHTML('afterbegin',noteHTML)
            notesStorage[id][1].forEach(renderPhotos)


            const input = insidepage.querySelector('input')
            const addPhotoBtn =insidepage.querySelector('#btn_photo')
            const closebtn = insidepage.querySelector('.btn_close')
            const textInNote = insidepage.querySelector('.note')


            let text = textInNote.innerHTML
            setInterval(() => {
                if(text !== textInNote.innerHTML){
                    text = textInNote.innerHTML
                    notesStorage[id][2] =  text
                }
            },1000)
            textInNote.insertAdjacentHTML('beforeend',notesStorage[id][2].replace(/^'$/g, '`'))


            editTextInside()
            textInNote.addEventListener('keydown', ()=>{
                if (event.key === 'Enter') {
                    document.execCommand('insertLineBreak')
                    event.preventDefault()
                }})
            closebtn.addEventListener('click',()=>{
                notelist.querySelectorAll('li').forEach(el => el.classList.remove('selected'))
                insidepage.innerHTML = ''
            })
            insidepage.addEventListener('click',photoHandler)
            addPhotoBtn.addEventListener('click',()=>input.click())
            input.addEventListener('change',()=>uploadHandler(id))
        }

        if(type === 'edit'){
            const title = li.querySelector('p')
            const titleContentBefore = title.textContent
            title.innerHTML =`<textarea required maxlength="66" spellcheck="false" ></textarea>`
            const textArea = li.querySelector('textarea')
            textArea.focus()
            textArea.addEventListener('keydown', () => {
                if(event.key ==='Enter'){
                    const titleContentAfter = textArea.value
                    notesStorage[id][0] = titleContentAfter
                    title.textContent = titleContentAfter
                    textArea.remove()
                }
            })
            textArea.addEventListener('focusout',event =>{ 
                if (!textArea.contains(event.relatedTarget)){
                    title.textContent = titleContentBefore
                    textArea.remove()
                }
                
            })
        }

        if(type === 'favourites'){
            const status =  li.dataset.fav
            if(status === 'true'){
                notesStorage[id][3] = false
            }
            if(status === 'false'){
                notesStorage[id][3] = true
            }
            notelist.innerHTML = ''
            renderNotes()
        }

        if(type === 'delete'){
            delete notesStorage[id]
            insidepage.innerHTML = ''
            li.classList.add('removing')
            setTimeout(() =>li.remove(),280)
        }
    }

    searchBtn.addEventListener('click',searchHandler)
    notelist.addEventListener('click',actionWithNote)
    addbtn.addEventListener('click',noteAddHandler)
    renderNotes()
}