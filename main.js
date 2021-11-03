/* --- Init game -------------------------------------------------------  */
Game.init("game-block");
Game.settings.style = "margin: auto; display: block;"
Game.resetSettings()
Game.setEventHandlers(['keydown', 'keyup'])
Game.setSize(new Vector2(1280, 720))

/* --- Init prefabs -------------------------------------------------------  */
Resources.resources_url = "resources/";
Resources.textures_dir = Resources.resources_url + "textures/"
Resources.fonts_dir = Resources.resources_url + "fonts/"

// Load resources
Resources.loadFont("es_font", "EverlastingSummer.ttf")

Resources.loadModule("scripts/custom_components.js")
Resources.loadModule("scripts/main_menu.js")
Resources.loadModule("scripts/dialogue.js")
Resources.loadModule("scripts/inventory.js")

// Start game
setTimeout(() =>
{
	MainMenu.init()
	DialogueMenu.init()
	InventoryWidget.init()

	Resources.dialogues = {}
	Resources.dialogues["alice_dialogue"] = new Dialogue("Алиса", "orange", "Эй, ты чего тут делаешь?")
	Resources.dialogues["alice_dialogue"]
	.addNext(new Dialogue("Ульяна", "red", "А ты? Почему ты не со всеми. И что это за свёрток у тебя в руке?"))
	.addNext(new Dialogue("Алиса", "orange", "Не твоё дело, иди с малышнёй играй"))

	Game.start();
}, 1000)

let comp = new TimerComponent()
alert(JSON.stringify(comp.default_properties))
