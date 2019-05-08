var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Articleschema = new Schema({
	title: {
		type: String,
		
	},
	link: {
		type: String,
		
	},
	summary: {
		type: String,
		
	},

	saved: {
		type: Boolean,
		default: false
	},
	
	note: [{
		type: Schema.Types.ObjectId,
		ref: "Note"
	}]
});

Articleschema.index({title: "text"});

const Article  = mongoose.model("Article", Articleschema);
module.exports = Article;