Resources.game_dir = "stories/mystery_story/"
Resources.resources_url = Resources.game_dir + "resources/";
Resources.textures_dir = Resources.resources_url + "textures/"
Resources.fonts_dir = Resources.resources_url + "fonts/"

let level = TiledLoader.loadLevel("counselor_house", true)
TiledLoader.onLoaded = function(level)
{
	let action_butt = new Entity("action_button")
	action_butt.addComponent("TransformComponent", {"position" : new Vector2(5, -30)})
	action_butt.addComponent("TextComponent", {"font" : "16px Arial", "autodraw" : false})
	Game.entities_named["actor"].addChild(action_butt)
}
