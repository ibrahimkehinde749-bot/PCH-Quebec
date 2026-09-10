import os
print('cwd:', os.getcwd())
print('exists icons dir:', os.path.exists('grant-program-website/icons'))
print('icons listing:', os.listdir('grant-program-website/icons') if os.path.exists('grant-program-website/icons') else [])
