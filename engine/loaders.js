class TiledLoader
{
  static resources_url = "";

  static loadLevel(name)
  {
    // Init level
    let level = new Entity(name)
    let tilesets = {}

    Resources.loadByURL(TiledLoader.resources_url + "levels/" + name + ".json", "json", function(data)
    {
      // Loading tilesets
      for(let i in data.tilesets)
      {
        let firstgid = data.tilesets[i].firstgid
        let src = data.tilesets[i].source;
        src = src.replace("..", TiledLoader.resources_url)
        Resources.loadByURL(src, "json", function(data)
        {
          tilesets[firstgid] = new Rect(data.columns, data.tilecount / data.columns, data.tilewidth, data.tileheight)
          Resources.loadTexture(data.name, data.image.replace("..", TiledLoader.resources_url), false )
          console.log(data)
        })
      }

      //Loading layers
      for(let i in data.layers)
      {
        let info = data.layers[i];
        let layer = new MatrixEntity(info.name, new Vector2(data.tilewidth, data.tileheight))

        // Load chunks
        for(let i in info.chunks)
        {
          let chunk = info.chunks[i]

          // Load items
          for(let y=0; y<chunk.height; y++)
          {
            for(let x=0; x<chunk.width; x++)
            {
              let id = x + y * chunk.width
              let item = chunk.data[id]
              if(item)
              {
                let entity = new Entity(item)
                entity.addComponent(new ImageComponent(), {})
                layer.setEntity(entity, new Vector2(chunk.x + x, chunk.y + y))
              }
            }
          }
        }

        level.addChild(layer)
      }
    })

    return level;
  }
}
