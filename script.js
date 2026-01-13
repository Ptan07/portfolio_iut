document.addEventListener("DOMContentLoaded", () => {
    // Apparition en douceur des sections au scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });
  
    fadeElements.forEach(el => observer.observe(el));
  
    // Diaporama
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;
  
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    }
  
    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      showSlide(currentIndex);
    });
  
    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    });
  
    setInterval(() => {
      currentIndex = (currentIndex + 1) % slides.length;
      showSlide(currentIndex);
    }, 5000);
  });
  