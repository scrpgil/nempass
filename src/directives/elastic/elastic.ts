import { Input, OnChanges, Directive, ElementRef, HostListener } from '@angular/core';
@Directive({
    selector: '[elastic]' 
})
export class ElasticDirective implements  OnChanges{
    @Input("trigger") trigger;

    constructor(private el: ElementRef) {
    }

    @HostListener('input', ['$event.target']) 
    public onInput() {
        this.adjust();
    }

    ngOnChanges(changes:any) {
        if(changes["trigger"]){
            setTimeout(() => {
                this.adjust();
            }, 10);
        }
    }
    private adjust(): void {
        let ta = this.el.nativeElement;
        let height = window.innerHeight;

        if (ta) {
            let overflow = ta.style.overflow;
            ta.style.overflow = 'hidden';
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 2 + 'px';

            if (overflow !== ta.style.overflow) {
                ta.style.overflow = overflow;
            }
        }
    }
}
