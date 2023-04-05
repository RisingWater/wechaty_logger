import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid'
import multer from 'multer'

import FileEmbedding from '../utils/FileEmbedding.js';

class UploadService {
    static uploadInfo = function () {
        var upload = multer({ dest: 'upload_tmp/' });
        return upload.any()
    }

    static upload = function (req, res) {
        var ext = path.extname(req.files[0].originalname);
        var dst_name = uuid() + ext;
        var des_file = "public/uploads/" + dst_name;

        var srcfile = process.cwd() + "/" + req.files[0].path;
        var dstfile = process.cwd() + "/" + des_file;
        fs.readFile(srcfile, function (err, data) {
            fs.writeFile(dstfile, data, function (err) {
                FileEmbedding.ProcessFile(dstfile);

                var result = {
                    result: 0,
                    messages: ""
                }
                res.send(result);
            });
        });

        fs.unlink(srcfile, () => { });
    }
}

export default UploadService;