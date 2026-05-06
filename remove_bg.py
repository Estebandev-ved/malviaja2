from rembg import remove
from PIL import Image

input_path = 'frontend/public/mascota.png'
output_path = 'frontend/public/mascota-nobg.png'

input_image = Image.open(input_path)
output_image = remove(input_image)
output_image.save(output_path)
print("Background removed successfully.")
