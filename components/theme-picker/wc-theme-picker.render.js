export function render() {
	return `<button id="theme-popover-button" class="tertiary" popovertarget="theme-popover">Theme</button>
 <div popover id="theme-popover" anchor="theme-popover-button" class="tail-top">
     <fieldset role="radiogroup" aria-label="Theme">
         <button role="radio" class="row align-center gap2" value="auto">
                 <svg height="16" width="16">
                     <path d="
                         M0 0 H8 V16 H0 Z
                         M8 0
                         A8 8 0 1 0 8 16
                         A8 8 0 1 0 8 0 Z
                     " fill="currentColor" fill-rule="evenodd"/>

                     <path d="
                         M8 0
                         A8 8 0 0 1 16 8
                         A8 8 0 0 1 8 16
                         Z
                     " fill="currentColor"/>
                 </svg>
                 <span>Auto</span>
         </button>
         <button role="radio" class="row align-center gap2" value="light">
                <svg height="16" width="16">
					<circle r="8" cx="8" cy="8" fill="none" stroke-width="4" stroke="currentColor" />
				</svg>
                <span>Light</span>
         </button>
         <button role="radio" class="row align-center gap2" value="dark">
            <svg height="16" width="16">
				<circle r="8" cx="8" cy="8" fill="currentColor" />
			</svg>
            <span>Dark</span>
         </button>
     </fieldset>
     </div>`;
}
