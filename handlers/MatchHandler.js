const { BaseHandler } = require("redweb");
const registry = require("./PlayerRegistry");

class MatchHandler extends BaseHandler {
    constructor() {
        super("match");
        this.matchTimer = null;
        this.matchDuration = 30000; // 30 seconds placeholder
        this.active = false;

        registry.setMaxPlayers(4, () => this.startMatch());
    }

    startMatch() {
        if (this.active) return;
        this.active = true;

        registry.broadcast({ type: "match_started" });

        this.matchTimer = setTimeout(() => {
            this.endMatch();
        }, this.matchDuration);
    }

    endMatch() {
        this.active = false;
        registry.broadcast({ type: "match_over" });
    }
}

module.exports = { MatchHandler };