import React from 'react'

export const AddEventHobbyBtn = (props) => {
  const { type } = props
  if(type === 'hobby') {
      return <a href="http://www.satakuntaevents.fi/" className="add-event hobby-text-red" style={{'position': 'initial', 'marginBottom': '12px'}}><span class="link-text">Lisää oma harrastuksesi</span></a>
  } 
     return <a href="http://www.satakuntaevents.fi/" className="add-event event-text-blue" style={{'position': 'initial', 'marginBottom': '12px'}}><span class="link-text">Lisää oma tapahtumasi</span></a>
}

export default AddEventHobbyBtn