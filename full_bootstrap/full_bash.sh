echo '**********'
echo 'Full Bootstrapping With Bash Step 1: Switch to first_minimal_bootstrap folder and execute Full Minimal Setup Step'
echo '**********'
cd ../first_minimal_bootstrap/bash/
sh full_first_minimal_bootstrap.sh
echo
echo
echo '**********'
echo 'Full Bootstrapping With Bash Step 2: Switch back to full_bootstrap folder and execute After Minimal Bash Step'
echo '**********'
cd ../../full_bootstrap/
sh after_minimal_bash.sh
