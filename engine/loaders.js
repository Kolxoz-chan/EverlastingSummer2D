class TiledLoader
{
  static resources_url = "";
  static onLoaded = null;

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
            entity.addComponent(new ImageComponent(), {"texture" : tile.texture})
            layer.setEntity(entity, new Vector2(chunk.x + x, chunk.y + y))
          }
        }
      }
    }

    return layer;
  }

  static loadChunkLayer(image, info, width, height)
  {
    let vec = new Vector2(width, height);
    let layer = new MatrixEntity(info.name, vec);

    // Load chunks
    for(let i in info.chunks)
    {
      let chunk = info.chunks[i]
      let name = info.name + "_chunk_" + chunk.x + "x" + chunk.y;

      let entity = new Entity()
      entity.addComponent(new ImageComponent(), {"texture" : name})
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
            Game.offscreen.drawImage(image, tile.rect.x, tile.rect.y, tile.rect.w, tile.rect.h,  x * tile.rect.w, y * tile.rect.h, tile.rect.w, tile.rect.h)
          }
        }
      }
      Resources.addTexture(name, Game.canvas.offscreen.transferToImageBitmap());
    }

    return layer;
  }

  static loadTile(image, tile)
  {
    Game.resetOffscreen(tile.rect.getSize())
    Game.offscreen.drawImage(image, tile.rect.x, tile.rect.y, tile.rect.w, tile.rect.h,  0, 0, tile.rect.w, tile.rect.h)
    Resources.addTexture(tile.texture, Game.canvas.offscreen.transferToImageBitmap());
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
        TiledLoader.tilesets.push({"texture" : name + "_" + x + "x" + y, "rect" : rect})
      }
    }
  }

  static loadLevel(name, use_chunks = false)
  {
    // Init level
    let level = new Entity(name)
    TiledLoader.tilesets = []

    Resources.loadByURL(TiledLoader.resources_url + "levels/" + name + ".json", "json", function(data)
    {
      // Loading tilesets
      for(let i in data.tilesets)
      {
        var tileset = data.tilesets[i];
        TiledLoader.loadTileset(tileset)

        // Load tiles
        Resources.loadTexture(name, tileset.image.replace("..", TiledLoader.resources_url), false, function()
        {
          for(let i in TiledLoader.tilesets)
          {
            TiledLoader.loadTile(this, TiledLoader.tilesets[i])
          }

          // Loading chunks
          if(use_chunks)
          {
            for(let i in data.layers)
            {
              let layer = TiledLoader.loadChunkLayer(this, data.layers[i], data.tilewidth * data.layers[i].width, data.tileheight * data.layers[i].height)
              level.addChild(layer)
            }
          }
        })
      }

      // Loading layers
      if(!use_chunks)
      {
        for(let i in data.layers)
        {
          let layer = TiledLoader.loadMatrixLayer(data.layers[i], data.tilewidth, data.tileheight)
          level.addChild(layer)
        }
      }

      if(TiledLoader.onLoaded) TiledLoader.onLoaded(level)
    })

    return level;
  }
}
