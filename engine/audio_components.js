/* Watcher Component */
class SoundComponent extends ComponentBase
{
	sound = null;
	autoplay = false;
	loop = false;

	play()
	{
		let audio = Resources.getAudio(this.sound)
		audio.currentTime=0;
		audio.play();
	}
}