import React from 'react'
import './HeaderNew.css'





const HeaderNew = () => {

  const scrollToSection = () => {
    document.getElementById("about-us").scrollIntoView({ behavior: "smooth" });
  };
  
  return (
    <div className='headerNew'>
      <img src="/header-bg-new.png" alt="" className='bg-header' />
      <img src="/Card.png" alt="" className='card-of-header'/>
      <img src="/try2.png" alt="" className='title-of-header'/>
      <img src="/box-hd2.gif" alt="" className='box-of-header'/>
      <img src="/hand-boxx-unscreen.gif" alt="" className='hand-of-header'/>
      <img src="/arrow-unscreen.gif" alt="" className='arrow-of-header'/>
      <img src="/e2-ezgif.com-crop (1).gif" alt="" className='run-of-header' />
      <button className="learn-more-btn" onClick={() => scrollToSection()}>
                View Items
              </button>
    </div>
  )
}

export default HeaderNew