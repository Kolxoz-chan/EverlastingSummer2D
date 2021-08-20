class TiledLoader
{
  static loadLevel(name)
  {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'file:///C:/Users/Сергей/Desktop/Текущие%20проекты/MicrocosmGame/resources/levels/' + name + '.json', true);
    xhr.send(); // (1)
    xhr.onreadystatechange = function()
    {
      if (xhr.readyState != 4) return;
      if (xhr.status == 200)
      {
        console.log(xhr.responseText)
      }
      else
      {
        return null;
      }
    }
  }
}
