from PIL import Image, ImageDraw
from pathlib import Path

images = sorted(Path('assets/images').glob('photo-*.jpg'))
thumbs = []
for path in images:
    image = Image.open(path).convert('RGB')
    image.thumbnail((260, 180))
    canvas = Image.new('RGB', (280, 220), 'white')
    canvas.paste(image, ((280-image.width)//2, 10))
    draw = ImageDraw.Draw(canvas)
    draw.text((10,190), f'{path.name}  {Image.open(path).size[0]}x{Image.open(path).size[1]}', fill='black')
    thumbs.append(canvas)

sheet = Image.new('RGB', (280*4, 220*((len(thumbs)+3)//4)), '#ddd')
for index, thumb in enumerate(thumbs):
    sheet.paste(thumb, ((index%4)*280, (index//4)*220))
sheet.save('assets/images/_asset-contact-sheet.jpg', quality=90)
print(f'created contact sheet with {len(thumbs)} images')
