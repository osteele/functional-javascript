MIN = 'functional.min.js'
PACKAGE = 'functional-1.0.2.tgz'
SOURCES = %w[CHANGES MIT-LICENSE README] +
  %w[examples.js functional.js to-function.js Rakefile] +
  [MIN]

task :default => [MIN+'.gz', PACKAGE]

task :publish => [PACKAGE, 'functional.min.js.gz'] do
  sh "rsync -avz . osteele.com:osteele.com/sources/javascript/functional --delete --exclude .git --exclude .hg"
end

file PACKAGE => SOURCES do |t|
  sh "tar cfz #{t.name} #{t.prerequisites}"
end

file 'functional.min.js' => %w[functional.js to-function.js] do |t|
  sh "cat #{t.prerequisites} | ruby ~/src/javascript/jsmin.rb > #{t.name}"
end

file MIN+'.gz' => MIN do |t|
  sh "gzip < #{t.prerequisites} > #{t.name}"
  puts "#{File.size(t.name)} bytes"
end
