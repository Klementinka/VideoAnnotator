# VideoAnnotator

Project for the Web Technologies course at FMI, SU which is about video annotation. In the project can be found 7 folders which contain styling, assets, scripts and code. In the main folder of the project can be found all of the different config files, and html files including the php file which is responsible for the authentication.

There needs to be a change in the httpd.conf file for the first page of the project.
DirectoryIndex index.html на login.html

To be sure that the encoding of the video is working with the FFmpeg library we have to add the following in the httpd.conf file
<IfModule mod_headers.c>
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>