export const transitionController = {
    fadeOut: (element, duration = 300) => {
      return new Promise((resolve) => {
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        element.style.opacity = '0';
        element.style.transform = 'translateX(-20px)';
        setTimeout(() => resolve(), duration);
      });
    },
  
    fadeIn: (element, duration = 300) => {
      return new Promise((resolve) => {
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        element.style.opacity = '1';
        element.style.transform = 'translateX(0)';
        setTimeout(() => {
          element.style.transition = '';
          resolve();
        }, duration);
      });
    },
  };
  