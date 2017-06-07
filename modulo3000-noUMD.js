/**
 * MODULO3000 [WIP]
 * http://github.com/ezekielaquino/SimpleValidate
 * Modular expanding elements
 * MIT License
 */

class Module {
  constructor(element, index, options) {
    Object.assign(this, {element, index, options});
    this.content = element.querySelector('.content');
    this.alignSelf = element.dataset.align === 'self';
    this.isOpen = false;

    this.layout();

    // Add an event listener to the entire element
    // Note: This would probably be attached to a child
    // element or other button instead of the entire area
    this.element.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      this.toggle(this.isOpen);
    });
  }

  layout() {
    this.width = this.options.container.offsetWidth / this.options.cols;
    this.height = this.options.rows ? window.innerHeight / this.options.rows : this.width;

    // Calculate pagePosition based on index / width
    this.position = {
      x: (this.index % this.options.cols) * this.width,
      y: Math.floor(this.index / this.options.cols) * this.height,
      cx: () => this.alignSelf ? 0 : this.position.x * this.scale.ix * -1,
      cy: () => this.alignSelf ? 0 : this.position.y * this.scale.iy * -1
    };
    // Calculate scale, remember we're scaling it down
    // form it's final scale(1) full width/height state
    // to its initial "minimized state"
    this.scale = {
      x: this.width / this.options.container.offsetWidth,
      y: this.height / window.innerHeight,
      ix: window.innerWidth / this.width,
      iy: window.innerHeight / this.height
    };

    // Set initial properties
    // Since we're using GSAP we'll just use GSAP's
    // set() method to apply styles for consistency
    TweenLite.set(this.element, {
      left: this.position.x,
      top: this.position.y,
      scaleX: this.scale.x,
      scaleY: this.scale.y
    });
    TweenLite.set(this.content, {
      x: this.position.cx,
      y: this.position.cy,
      scaleX: this.scale.ix,
      scaleY: this.scale.iy
    });

    this.element.classList.add('is-init');
  }

  // TOGGLE
  toggle(open) {
    // set global active to current module
    if (open) window.activeModule = this;
    else window.activeModule = undefined;

    // Set/remove classes
    document.body.classList.add('in-item');
    this.element.classList.add('is-toggled');
    this.element.classList.toggle('is-opened');
    this.element.classList.remove('is-overflow');

    // Animation
    TweenLite.to(this.element, 1, {
      x: open ? this.position.x * -1 : 0,
      y: open ? (this.position.y * -1) + window.scrollY + this.options.offset : 0,
      scaleX: open ? 1 : this.scale.x,
      scaleY: open ? 1 : this.scale.y,
      ease: Expo.easeInOut,
      force3D: true,
      onComplete: () => {
        if (!open) {
          document.body.classList.remove('in-item');
          this.element.classList.remove('is-toggled');
        }
      }
    });

    // Content's counter to the parent's transform
    // Note: For some weird reason we're having a distort
    // even if the two transforms are basically "cancelling"
    // each other out. But the effect is interesting anyway.
    TweenLite.to(this.content, 1, {
      x: open ? 0 : this.position.cx,
      y: open ? 0 : this.position.cy,
      scaleX: open ? 1 : this.scale.ix,
      scaleY: open ? 1 : this.scale.iy,
      ease: Expo.easeInOut,
      force3D: true
    });
  }

  // INITIALIZE
  static init(options = {}) {
    const container = document.querySelector(options.container || '.js-modulo');

    options = {
      container: container,
      selector: options.selector || '.js-moduloModule',
      cols: options.cols || 3,
      rows: options.rows,
      offset: options.offset || container.getBoundingClientRect().top
    };

    const modules = options.container.querySelectorAll(options.selector);
    window.modules = [];

    // Loop through all selectors and create an instance
    for (const [index, module] of modules.entries()) {
      const instance = new Module(module, index, options);
      window.modules.push(instance);
    }

    // Esc as exit from toggled state
    window.addEventListener('keyup', (event) => {
      if (event.keyCode == 27) window.activeModule.toggle(false);
    });

    window.addEventListener('resize', () => {
      for (const module of window.modules) {
        module.layout();
      }
    });
  }
}

export default Module;