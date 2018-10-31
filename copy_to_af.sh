set -xe

DEST=../cs1-v2/frontend/src/brython

(cd scripts && python make_dist.py)

rm -rf "$DEST"
mkdir "$DEST"
cp -r www/src/brython.js www/src/brython_stdlib.js www/src/libs www/src/Lib setup "$DEST"

git log -n 1 --pretty=format:"%H" > $DEST/git-sha.txt

# Remove files that we don't need
rm -rf "$DEST/setup/data" "$DEST/Lib/test" "$DEST/setup/changelog.txt"
