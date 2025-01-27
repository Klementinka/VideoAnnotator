# VideoAnnotator
Project for the Web Technologies course at FMI, SU

to be sure that the encoding of the video is working with the FFmpeg library we have to add the following in the httpd.conf file
<IfModule mod_headers.c>
    Header always set Cross-Origin-Opener-Policy "same-origin"
    Header always set Cross-Origin-Embedder-Policy "require-corp"
</IfModule>