class TiledLoader
{
  static onLoaded = null;
  static tilesize = new Vector2(0, 0);

  static loadMatrixLayer(info, width, height)
  {
    let layer = new MatrixEntity(info.name, new Vector2(width, height))

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
            let tile = TiledLoader.tilesets[item-1]

            let entity = new Entity()
            entity.addComponent("ImageComponent", {"texture" : tile.texture})
            layer.setEntity(entity, new Vector2(chunk.x + x, chunk.y + y))
          }
        }
      }
    }

    return layer;
  }

  static loadChunkLayer(info, width, height)
  {
    let vec = new Vector2(width, height);
    let layer = new MatrixEntity(info.name, vec);

    // Load chunks
    for(let i in info.chunks)
    {
      let chunk = info.chunks[i]
      let name = info.name + "_chunk_" + chunk.x + "x" + chunk.y;

      let entity = new Entity()
      entity.addComponent("ImageComponent", {"texture" : name})
      layer.setEntity(entity, new Vector2(chunk.x / chunk.width, chunk.y / chunk.height))

      Game.resetOffscreen(vec)

      for(let y=0; y<chunk.height; y++)
      {
        for(let x=0; x<chunk.width; x++)
        {
          let id = x + y * chunk.width
          let item = chunk.data[id]
          if(item)
          {
            let tile = TiledLoader.tilesets[item-1]
            let pos = new Vector2(TiledLoader.tilesize.x * x, TiledLoader.tilesize.y * y)
            //if(pos.y != 0) pos.y -= tile.rect.h;
            Game.offscreen.drawImage(Resources.textures[tile.texture], pos.x, pos.y, tile.rect.w, tile.rect.h)
          }
        }
      }
      let img = new Image()
      img.src = Game.canvas.offscreen.toDataURL()
      Resources.addTexture(name, img);
    }

    return layer;
  }

  static loadObjectLayer(info)
  {
   let layer = new Entity(info.name)
 
    for(let i in info.objects)
    {
      let obj = info.objects[i]
      let tile = TiledLoader.tilesets[obj.gid - 1]
      //alert(obj.width + "x" + obj.height)
      let ent = new Entity(obj.name)
      ent.addComponent("TransformComponent", {"position" : new Vector2(obj.x, obj.y - obj.height), "size" : new Vector2(obj.width, obj.height)});
      ent.addComponent("ImageComponent", {"texture" : tile.texture});
      for(let i in obj.properties)
      {
        let prop = obj.properties[i]
        ent.addComponent(prop.name, prop.value.length > 0 ? TiledLoader.evalJSON(prop.value) : {});
      }
      layer.addChild(ent)
    }

    return layer
  }

  static evalJSON(code)
  {
    try
    {
      let x = eval("() => { return "+ code +"; }"); 
      return x();
    }
    catch(err)
    {
      alert(err.stack)
      return {};
    }
  }

  static loadTile(tile)
  {
    Game.resetOffscreen(tile.rect.getSize())
    Game.offscreen.drawImage(Resources.textures[tile.name], tile.rect.x, tile.rect.y, tile.rect.w, tile.rect.h,  0, 0, tile.rect.w, tile.rect.h)

    let img = new Image()
    img.src = Game.canvas.offscreen.toDataURL()
    Resources.addTexture(tile.texture, img);
  }

  static loadTileset(tileset)
  {
    let rows = tileset.tilecount / tileset.columns;
    let name = tileset.name;

    for(let y=0; y<rows; y++)
    {
      for(let x=0; x<tileset.columns; x++)
      {
        let rect = new Rect(x * tileset.spacing + tileset.margin + x * tileset.tilewidth, y * tileset.spacing + tileset.margin + y * tileset.tileheight, tileset.tilewidth, tileset.tileheight)
        TiledLoader.tilesets.push({"name" : name, "texture" : name + "_" + x + "x" + y, "rect" : rect})
      }
    }
  }

  static loadLevel(name, use_chunks = false)
  {
    // Init level
    let level = new Entity(name)
    TiledLoader.tilesets = [] 

    Resources.loadByURL(Resources.resources_url + "levels/" + name + ".json", "json", function(data)
    {
      let counter = data.tilesets.length
      TiledLoader.tilesize = new Vector2(data.tilewidth, data.tileheight)

      // Loading tilesets
      for(let i in data.tilesets)
      {
        var tileset = data.tilesets[i];
        TiledLoader.loadTileset(tileset)

        // Load tiles
        Resources.loadTexture(tileset.name, tileset.image.replace("..", Resources.resources_url), false, function()
        {
          // Loading data after loading tilesets
          counter--;
          if(counter <= 0)
          {
            for(let i in TiledLoader.tilesets)
            {
              TiledLoader.loadTile(TiledLoader.tilesets[i])
            }

            // Loading layers
            for(let i in data.layers)
            {
              let layer = null;
              let lay = data.layers[i]

              if(lay.type == "tilelayer")
              {
                if(use_chunks)
                {
                  layer = TiledLoader.loadChunkLayer(lay, TiledLoader.tilesize.x * 16, TiledLoader.tilesize.y * 16)
                }
                else
                {
                  layer = TiledLoader.loadMatrixLayer(lay, TiledLoader.tilesize.x, TiledLoader.tilesize.y)
                }
              }
              else if(lay.type == "objectgroup")
              {
                layer = TiledLoader.loadObjectLayer(lay)
              }

              if(layer) level.addChild(layer)
            }

            // Callback
            if(TiledLoader.onLoaded) TiledLoader.onLoaded(level)
          }
        })
      }
    })

    return level;
  }
}
