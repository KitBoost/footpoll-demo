/**
 * Iframe Alert
 *
 * Displays a custom UI within the space.
 *
 * @license MIT
 * @author Joe
             inAccordion: false,
 */
module.exports = class IframeAlert extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'hud' }
    static get name()           { return 'hud' }
    static get description()    { return 'hud' }

    /** Called when the plugin is loaded */
    async onLoad() {

        // Allow message to be configured
        this.menus.register({
            id: 'hud',
            title: 'hud-menu-label',
            icon: this.paths.absolute('icon.svg'),
            text: 'hud-text',
            section: 'overlay-top',
            panel: {
                iframeURL: this.paths.absolute('pollhud.html'),
                width: 500,
                height: 500
            }
        })

    }

}
