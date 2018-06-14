set -x

DEST=../cs1-v2/animation-framework/brython

(cd scripts && python make_dist.py)

rm -rf "$DEST"
mkdir "$DEST"
cp -r www/src/brython.js www/src/brython_stdlib.js www/src/libs www/src/Lib setup "$DEST"

# Remove package archives
rm "$DEST/setup/data/Brython-*"
rm -rf "$DEST/Lib/test"
