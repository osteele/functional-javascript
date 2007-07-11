require 'ows_tasks'

task 'docs/bezier.php' => 'bezier.js' do |t|
    jsrdoc 'bezier.js', t.name, 'JavaScript Beziers'
end

task 'docs/gradients.php' => 'gradients.js' do |t|
    jsrdoc 'gradients.js', t.name, 'JavaScript Gradient Roundrects'
end

task 'docs/divstyle.php' => 'divstyle.js' do |t|
    jsrdoc 'divstyle.js', t.name, 'DivStyle'
end

task 'docs/inline-console.php' => 'inline-console.js' do |t|
    jsrdoc 'inline-console.js', t.name, 'Inline Console'
end

task 'docs/path.php' => 'path.js' do |t|
    jsrdoc 'path.js', t.name, 'JavaScript Paths'
end

task 'docs/readable.php' => 'readable.js' do |t|
    jsrdoc 'readable.js', t.name, 'Readable'
end

task 'docs/textcanvas.php' => 'textcanvas.js' do |t|
    jsrdoc 'textcanvas.js', t.name, 'TextCanvas'
end

task :docs => 'docs/bezier.php'
task :docs => 'docs/path.php'
task :docs => 'docs/divstyle.php'
task :docs => 'docs/gradients.php'
task :docs => 'docs/inline-console.php'
task :docs => 'docs/readable.php'
task :docs => 'docs/textcanvas.php'

task :default => :docs
