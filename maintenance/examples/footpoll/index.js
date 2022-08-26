/**
 * Foot Poll
 *
 * @license MIT
 * @author Joe Sandmeyer
 */
module.exports = class FootPollPlugin extends BasePlugin {

    /** Plugin info */
    static get id()             { return 'footpoll-plugin' }
    static get name()           { return 'Foot Poll' }    
    static get description()    { return 'Visitors to a space can vote with their feet. This plugin counts the number of visitors standing on each linked polling target.' }

    /** Called on load */
    onLoad() {

        // Create a button in the toolbar
        this.menus.register({
            icon: this.paths.absolute('button-icon.png'),
            text: 'FootPollPlugin',
            action: () => this.onButtonPress()
        })

    }

    /** Called when the user presses the action button */
    onButtonPress() {

        // Show alert
        this.menus.alert("Hello from FootPollPlugin")

    }

}
