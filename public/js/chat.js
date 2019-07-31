const socket = io()

//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('#sendMessageBtn' )
const $shareLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username , room } = Qs.parse(location.search,{ignoreQueryPrefix:true}) 

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//read message sent
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    console.log(message)
    autoscroll()
})

//read location message
socket.on('locationMessage',(url)=>{
    const html1=Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html1)
    console.log(url)
    autoscroll()
})

//sidebar list

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.message.value
    $messageFormButton.setAttribute('disabled','disabled')
    socket.emit('sendMessage', message,()=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        console.log('message delivered')
    })
})

$shareLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }
    $shareLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $shareLocationButton.removeAttribute('disabled')
            console.log('Location shared !')
        })
    })
})

socket.emit('join',({username,room}),(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})