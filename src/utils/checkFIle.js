const fs = require('fs');

export const checkFile = async path => {
  try {
    await fs.accessSync(path, fs.constants.F_OK);
    
    return path;

  } catch (err) {
        return null;
  }
}


export  const checkFileAndUpdateDb = async (id, path, TarckModel) => {
  try {

    const pathToTrack = await checkFile(path);

    if (pathToTrack) return path;
    else {
      await TarckModel.findOneAndUpdate(
        { id } ,
        {
          pathToFile : "",
          converted : 0,
           downloaded : 0 ,
        },
        err => { if(err) console.log('Can`t save checkFile to db:', id,', ', '(' + err.message + ')') }
      )
      return null;
    }

  } catch (err) {
        return null;
  }
}