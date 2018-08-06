set -xe

DEST=../cs1-v2/frontend/src/brython

(cd scripts && python make_dist.py)

rm -rf "$DEST"
mkdir "$DEST"
cp -r www/src/libs www/src/Lib setup "$DEST"

# Remove files that we don't need
rm -rf "$DEST/setup/data" "$DEST/Lib/test" "$DEST/setup/changelog.txt"
